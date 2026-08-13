import { useState, useCallback, useMemo } from 'react';
import type { Notification } from '../../../../domain/entities/notification/notification';
import { useApiClient } from '../../../context/api/ApiClinetProvider';
import { createNotificationsRepository } from '../../../../infrastructure/repositories/NotificationsRepository';
import { createNotificationsUseCase } from '../../../../application/usecases/manageNotificationsUseCase';
import { handleApiError } from '../../../utils/handleApiError';
import { useIdempotency } from '../../useIdempotency';

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

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = useMemo(() => createNotificationsRepository(apiClient), [apiClient]);
  const useCase = useMemo(() => createNotificationsUseCase(repository), [repository]);
  const idem = useIdempotency();

  const clearError = useCallback(() => setError(null), []);

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