import type { ApiClient } from "../../domain/common/api/ApiClient";
import type { DomainResponse } from "../../domain/common/responce/DomainResponse";
import type { Notification } from "../../domain/entities/notification/notification";
import type { INotificationsRepository } from "../../domain/repositories/INotificationsRepository";

export function createNotificationsRepository(apiClient: ApiClient): INotificationsRepository {
  const baseUrl = "/shared-kernal/notifications";
  return {
    getNotifications: () => apiClient.get<DomainResponse<Notification[]>>(baseUrl),
    markAsRead: (notificationId: string, idempotencyKey?: string) =>
      apiClient.post<DomainResponse<Notification>>(
        `${baseUrl}/${notificationId}/read`,
        undefined,
        idempotencyKey ? { headers: { "Idempotency-Key": idempotencyKey } } : undefined
      ),
    markAllAsRead: (idempotencyKey?: string) =>
      apiClient.post<DomainResponse<Notification>>(
        `${baseUrl}/read-all`,
        undefined,
        idempotencyKey ? { headers: { "Idempotency-Key": idempotencyKey } } : undefined
      ),
  };
}