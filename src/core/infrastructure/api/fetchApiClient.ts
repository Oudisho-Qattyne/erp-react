// src/core/infrastructure/api/fetchApiClient.ts
import { getToken } from '../auth/authStorage';
import { createApiError } from '../../domain/common/errors/ApiError';
import type { ApiClient, RequestConfig } from '../../domain/common/api/ApiClient';

export function createFetchApiClient(
  baseURL: string,
  getLanguage: () => string
): ApiClient {
  const buildUrl = (url: string, params?: Record<string, string>): string => {
    const fullUrl = new URL(baseURL + url);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        fullUrl.searchParams.append(key, value);
      });
    }
    return fullUrl.toString();
  };

  const request = async <T>(url: string, config: RequestConfig = {}): Promise<T> => {
    const token = getToken();
    const headers = new Headers(config.headers || {});

    const language = getLanguage();
    if (language) {
      headers.set('Accept-Language', language);
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Only set Content-Type to application/json if body is not FormData
    const body = config.body;
    if (!headers.has('Content-Type') && body && !(body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const requestUrl = buildUrl(url, config.params);
    const response = await fetch(requestUrl, { ...config, headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.message || `HTTP error! status: ${response.status}`;
      const validationErrors = errorData?.validationErrors;
      throw createApiError(message, validationErrors, response.status);
    }

    if (response.status === 204) {
      return null as any as T;
    }

    return response.json();
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
    delete: <T>(url: string, config?: RequestConfig) => request<T>(url, { ...config, method: 'DELETE' }),
  };
}