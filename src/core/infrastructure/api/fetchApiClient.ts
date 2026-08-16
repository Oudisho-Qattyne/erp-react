// src/core/infrastructure/api/fetchApiClient.ts
import { getToken, removeToken, removeAuthUser } from '../auth/authStorage';
import { createApiError } from '../../domain/common/errors/ApiError';
import type { ApiClient, RequestConfig } from '../../domain/common/api/ApiClient';
import enShared from '../../presentation/locales/en.json';
import arShared from '../../presentation/locales/ar.json';

function getLocalizedMessage(key: string, language: string): string {
  const dict = language === 'ar' ? arShared : enShared;
  const value = key.split('.').reduce<unknown>(
    (acc, k) => (acc && typeof acc === 'object' && k in acc ? (acc as Record<string, unknown>)[k] : undefined),
    dict
  );
  return typeof value === 'string' ? value : key;
}

export function createFetchApiClient(
  baseURL: string,
  getLanguage: () => string
): ApiClient {
  const DEFAULT_TIMEOUT = 60_000;

  const buildUrl = (url: string, params?: Record<string, string | boolean | number | Array<string | number>>): string => {
    const fullUrl = new URL(baseURL + url);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => fullUrl.searchParams.append(key, String(item)));
        } else {
          fullUrl.searchParams.append(key, String(value));
        }
      });
    }
    return fullUrl.toString();
  };

  const request = async <T>(url: string, config: RequestConfig = {}): Promise<T> => {
    const { timeout = DEFAULT_TIMEOUT, signal: externalSignal, ...restConfig } = config;
    const token = getToken();
    const headers = new Headers(config.headers || {});

    const language = getLanguage();
    if (language) {
      headers.set('Accept-Language', language);
    }
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const body = config.body;
    if (!headers.has('Content-Type') && body && !(body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const requestUrl = buildUrl(url, config.params);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const onExternalAbort = () => controller.abort();
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener('abort', onExternalAbort);
      }
    }

    let response: Response;
    try {
      response = await fetch(requestUrl, { ...restConfig, signal: controller.signal, headers });
    } catch {
      // Network failure (offline, DNS, CORS, etc.) or timeout — status 0 marks it as a connection error
      if (controller.signal.aborted && !externalSignal?.aborted) {
        throw createApiError('Request timeout', undefined, 0);
      }
      throw createApiError('Failed to fetch', undefined, 0);
    } finally {
      clearTimeout(timer);
      externalSignal?.removeEventListener('abort', onExternalAbort);
    }

    // Handle error responses (non‑2xx)
    if (!response.ok) {
      if (response.status === 401) {
        removeToken();
        removeAuthUser();
        window.location.href = '/auth';
        throw createApiError('Unauthorized', undefined, 401);
      }
      const errorData = await response.json().catch(() => null);
      const message = response.status >= 500
        ? getLocalizedMessage('common.server_error', language)
        : errorData?.message || `HTTP error! status: ${response.status}`;
      const validationErrors = errorData?.validationErrors;
      throw createApiError(message, validationErrors, response.status, errorData);
    }

    // No content (204) or empty body – return null
    if (response.status === 204) {
      return null as any as T;
    }

    const responseType = config.responseType || 'json';

    if (responseType !== 'json') {
      return response[responseType]() as any;
    }

    // Parse JSON body. Some servers (idempotency replays, proxies) send a real body
    // with a misleading Content-Length: 0 or missing Content-Type, so we must not
    // trust those headers — only the actual parse decides.
    const text = await response.text();
    if (!text) return null as any as T;
    try {
      return JSON.parse(text);
    } catch {
      // Not JSON – return null (or empty array if T is array)
      return null as any as T;
    }
  };

  return {
    get: <T>(url: string, config?: RequestConfig) => request<T>(url, { ...config, method: 'GET' }),
    post: <T, U = any>(url: string, data?: U, config?: RequestConfig) =>
      request<T>(url, {
        ...config,
        method: 'POST',
        body: data instanceof FormData ? data : JSON.stringify(data),
      }),
    put: <T, U = any>(url: string, data?: U, config?: RequestConfig) =>
      request<T>(url, {
        ...config,
        method: 'PUT',
        body: data instanceof FormData ? data : JSON.stringify(data),
      }),
    patch: <T, U = any>(url: string, data?: U, config?: RequestConfig) =>
      request<T>(url, {
        ...config,
        method: 'PATCH',
        body: data instanceof FormData ? data : JSON.stringify(data),
      }),
    delete: <T, U = any>(url: string, data?: U, config?: RequestConfig) => request<T>(url, {
      ...config,
      method: 'DELETE',
      body: data ? (data instanceof FormData ? data : JSON.stringify(data)) : undefined,
    }),
  };
}