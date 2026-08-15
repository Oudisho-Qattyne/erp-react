// src/core/presentation/utils/handleApiError.ts
import { toast } from "sonner";
import { isApiError } from "../../domain/common/errors/ApiError";
import enShared from "../locales/en.json";
import arShared from "../locales/ar.json";

const DEBUG = import.meta.env.VITE_DEBUG_ERRORS === "true";

export interface HandleApiErrorOptions {
  module?: string;
  silent?: boolean;
  passThrough?: boolean;
  t?: (key: string, module?: string) => string;
}

export interface ServerValidationErrors {
  validationErrors?: Record<string, string | string[]>;
}

// Status codes whose backend messages are trusted to be shown to the user
const WHITELISTED_MESSAGE_STATUSES = new Set([409]);

const DEDUPE_WINDOW_MS = 1500;

let lastToast: { message: string; at: number } | null = null;

function getLanguage(): string {
  if (typeof window === "undefined") return "ar";
  try {
    return localStorage.getItem("locale") === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
}

function readShared(key: string, language: string): string {
  const dict = language === "ar" ? arShared : enShared;
  const value = key.split(".").reduce<unknown>(
    (acc, k) => (acc && typeof acc === "object" && k in acc ? (acc as Record<string, unknown>)[k] : undefined),
    dict
  );
  return typeof value === "string" ? value : key;
}

function translate(key: string, language: string, options?: { module?: string; t?: (k: string, m?: string) => string }): string {
  if (options?.t) {
    const fromT = options.t(key, options.module);
    if (fromT && fromT !== key) return fromT;
  }
  return readShared(key, language);
}

function isRealBackendMessage(message: string): boolean {
  return !!message && !message.startsWith("HTTP error!") && message !== "Failed to fetch";
}

function showToast(message: string): void {
  const now = Date.now();
  if (lastToast && lastToast.message === message && now - lastToast.at < DEDUPE_WINDOW_MS) return;
  lastToast = { message, at: now };
  toast.error(message);
}

/**
 * Centralized error handler: classifies an error and returns a safe, localized
 * display message. Shows an error toast unless `silent` is true.
 *
 * - 401:          no toast (client already redirects to login)
 * - 403:          forbidden
 * - 422           generic invalid-input toast (backend message only when `passThrough` is set)
 * - 404           resource not found
 * - 409           backend message (whitelisted business errors)
 * - 429           too many requests
 * - 5xx / network generic "try again later" messages
 * - other 4xx     sanitized generic, unless `passThrough` is set
 * - plain Error   message as-is (development errors surface)
 */
export function handleApiError(error: unknown, options?: HandleApiErrorOptions): string {
  const { silent = false, passThrough = false } = options ?? {};
  const language = getLanguage();

  if (DEBUG) {
    console.error("[handleApiError]", error);
  }

  let status: number | undefined;
  let message: string | undefined;

  if (isApiError(error)) {
    status = error.status;
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = String(error);
  }

  const backendMessage = (message ?? "Unknown error").trim();
  const showBackend = () => (isRealBackendMessage(backendMessage) ? backendMessage : translate("common.request_error", language, options));

  let finalMessage: string;
  let shouldToast = true;

  if (status === 401) {
    shouldToast = false;
    finalMessage = backendMessage === "Unauthorized" ? translate("common.unauthorized", language, options) : backendMessage;
  } else if (status === undefined) {
    finalMessage = backendMessage;
  } else if (status === 0) {
    finalMessage = translate("common.network_error", language, options);
  } else if (status === 403) {
    finalMessage = translate("common.forbidden", language, options);
  } else if (status === 422) {
    finalMessage = passThrough ? showBackend() : translate("common.invalid_input", language, options);
  } else if (status === 404) {
    finalMessage = translate("common.resource_not_found", language, options);
  } else if (status === 429) {
    finalMessage = translate("common.too_many_requests", language, options);
  } else if (WHITELISTED_MESSAGE_STATUSES.has(status)) {
    finalMessage = showBackend();
  } else if (status >= 500) {
    finalMessage = translate("common.server_error", language, options);
  } else if (status >= 400 && status < 500) {
    finalMessage = passThrough ? showBackend() : translate("common.request_error", language, options);
  } else {
    finalMessage = showBackend();
  }

  if (shouldToast && !silent) {
    showToast(finalMessage);
  }
  return finalMessage;
}

/**
 * Maps backend validationErrors to react-hook-form setError and scrolls to the
 * first failing field. Returns true if any validation errors were applied.
 */
export function applyServerValidationErrors(
  err: ServerValidationErrors,
  setError: (field: any, error: { message: string }) => void,
  options?: { scrollToFirst?: boolean }
): boolean {
  const entries = err.validationErrors ? Object.entries(err.validationErrors) : [];
  if (entries.length === 0) return false;

  const scrollToFirst = options?.scrollToFirst ?? true;
  entries.forEach(([field, msgs]) => {
    const msg = Array.isArray(msgs) ? msgs[0] : String(msgs);
    setError(field, { message: msg });
  });

  if (scrollToFirst) {
    const firstField = entries[0][0];
    const el = document.querySelector(`[for="${firstField}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return true;
}