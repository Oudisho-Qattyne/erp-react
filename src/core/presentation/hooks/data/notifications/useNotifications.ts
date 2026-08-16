import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { Notification } from '../../../../domain/entities/notification/notification';
import { useApiClient } from '../../../context/api/ApiClinetProvider';
import { createNotificationsRepository } from '../../../../infrastructure/repositories/NotificationsRepository';
import { createNotificationsUseCase } from '../../../../application/usecases/manageNotificationsUseCase';
import { subscribeNotificationChannel, type NotificationEchoCallbacks, type BroadcastNotificationData } from '../../../../application/usecases/notificationEchoUseCase';
import { handleApiError } from '../../../utils/handleApiError';
import { useIdempotency } from '../../useIdempotency';
import { useAuth } from '../../../../infrastructure/auth/AuthProvider';
import { createEcho } from '../../../../infrastructure/echo/echo';
import { playNotificationSound } from '../../../../infrastructure/audio/notificationSounds';

export interface UseNotificationsReturn {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  getNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const apiClient = useApiClient();
  const { user } = useAuth();
  const currentUserId = user?.id as number | undefined;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => createNotificationsRepository(apiClient), [apiClient]);
  const useCase = useMemo(() => createNotificationsUseCase(repository), [repository]);
  const idem = useIdempotency();

  const clearError = useCallback(() => setError(null), []);

  const cbRef = useRef<NotificationEchoCallbacks>(null as any);

  const pushNotification = useCallback((type: string, data: BroadcastNotificationData) => {
    const notification: Notification = {
      id: String(data.id ?? crypto.randomUUID()),
      type,
      data: data.payload ? { payload: data.payload } : null,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [notification, ...prev.filter((n) => n.id !== notification.id)]);
  }, []);

  // Keep cbRef.current always up to date
  cbRef.current = {
    onBroadcastNotification: (data) => {
      playNotificationSound()
      if (data.type === 'transaction.created') {
        pushNotification('subscription_request.transaction_created', data);
      } else if (data.type === 'subscription_request.transaction_updated') {
        pushNotification('transaction_approved.subscription_reqeust', data);
      }
    },
  };

  // Subscribe to the notifications channel — runs once per user
  useEffect(() => {
    if (!currentUserId) return;

    const echo = createEcho();
    subscribeNotificationChannel(echo, currentUserId, cbRef);
  }, [currentUserId]);

  const getNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await useCase.getNotifications();
      setNotifications(res.data);
    } catch (err: unknown) {
      setError(handleApiError(err, { module: 'core', silent: true }));
    } finally {
      setLoading(false);
    }
  }, [useCase]);

  const markAsRead = useCallback(async (notificationId: string) => {
    setError(null);
    try {
      await idem.run('markAsRead', notificationId, (key) => useCase.markAsRead(notificationId, key));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (err: unknown) {
      setError(handleApiError(err, { module: 'core', silent: true }));
    }
  }, [useCase, idem]);

  const markAllAsRead = useCallback(async () => {
    setError(null);
    try {
      await idem.run('markAllAsRead', undefined, (key) => useCase.markAllAsRead(key));
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: now })));
    } catch (err: unknown) {
      setError(handleApiError(err, { module: 'core', silent: true }));
    }
  }, [useCase, idem]);

  return {
    notifications,
    loading,
    error,
    getNotifications,
    markAsRead,
    markAllAsRead,
    clearError,
  };
};