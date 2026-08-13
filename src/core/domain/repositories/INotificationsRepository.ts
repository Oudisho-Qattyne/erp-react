import type { Notification } from "../entities/notification/notification";
import type { DomainResponse } from "../common/responce/DomainResponse";

export interface INotificationsRepository {
  getNotifications: () => Promise<DomainResponse<Notification[]>>;
  markAsRead: (notificationId: string, idempotencyKey?: string) => Promise<DomainResponse<Notification>>;
  markAllAsRead: (idempotencyKey?: string) => Promise<DomainResponse<Notification>>;
}