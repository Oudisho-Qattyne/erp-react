export interface ApiError extends Error {
  validationErrors?: Record<string, string | string[]>;
  status?: number;
}

export function createApiError(
  message: string,
  validationErrors?: Record<string, string | string[]>,
  status?: number
): ApiError {
  const error = new Error(message) as ApiError;
  error.name = 'ApiError';
  error.validationErrors = validationErrors;
  error.status = status;
  return error;
}

export function isApiError(error: any): error is ApiError {
  return error && error.name === 'ApiError';
}
