export interface RequestConfig extends RequestInit {
  params?: Record<string, string | boolean | number | Array<string | number>>;
  responseType?: 'json' | 'blob' | 'text' | 'arrayBuffer';
  /** Timeout in ms before the request is aborted (default 60s) */
  timeout?: number;
}

export interface ApiClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T, U = any>(url: string, data?: U, config?: RequestConfig): Promise<T>;
  put<T, U = any>(url: string, data?: U, config?: RequestConfig): Promise<T>;
  patch<T, U = any>(url: string, data?: U, config?: RequestConfig): Promise<T>;
  delete<T, U = any>(url: string, data?: U, config?: RequestConfig): Promise<T>;
}
