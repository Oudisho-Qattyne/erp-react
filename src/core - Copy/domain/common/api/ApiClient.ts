export interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

export interface ApiClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T, U = any>(url: string, data?: U, config?: RequestConfig): Promise<T>;
  put<T, U = any>(url: string, data?: U, config?: RequestConfig): Promise<T>;
  patch<T, U = any>(url: string, data?: U, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}
