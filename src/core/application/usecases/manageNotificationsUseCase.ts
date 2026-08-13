import type { INotificationsRepository } from "../../domain/repositories/INotificationsRepository";

export const createNotificationsUseCase = (repository: INotificationsRepository) => {
  return {
    getNotifications: () => repository.getNotifications(),
    markAsRead: (notificationId: string, idempotencyKey?: string) =>
      repository.markAsRead(notificationId, idempotencyKey),
    markAllAsRead: (idempotencyKey?: string) => repository.markAllAsRead(idempotencyKey),
  };
};