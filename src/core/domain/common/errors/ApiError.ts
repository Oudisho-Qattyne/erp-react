export interface ApiError extends Error {
  validationErrors?: Record<string, string | string[]>;
  status?: number;
  data?: unknown;
}

export function createApiError(
  message: string,
  validationErrors?: Record<string, string | string[]>,
  status?: number,
  data?: unknown
): ApiError {
  const error = new Error(message) as ApiError;
  error.name = 'ApiError';
  error.validationErrors = validationErrors;
  error.status = status;
  error.data = data;
  return error;
}

export function isApiError(error: any): error is ApiError {
  return error && error.name === 'ApiError';
}
