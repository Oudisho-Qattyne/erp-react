import { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useLanguage } from '../../../context/i18n/I18nProvider';
import { useNotifications } from '../../../hooks/data/notifications/useNotifications';
import { getNotificationHandler, type NotificationHandlerConfig } from '../../../../registry/notifications/notificationRegistry';
import type { Notification } from '../../../../domain/entities/notification/notification';

function formatRelativeTime(dateStr: string | null | undefined, language: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';
  const locale = language === 'ar' ? 'ar' : 'en';
  const diffMinutes = Math.round((date.getTime() - Date.now()) / 60000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) return rtf.format(diffDays, 'day');
  return date.toLocaleDateString(locale);
}

function fallbackTitle(notification: Notification): string {
  return typeof notification.type === 'string' ? notification.type.replace(/_/g, ' ') : '';
}

export function NotificationsBell() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { notifications, loading, error, getNotifications, markAsRead, markAllAsRead, clearError } =
    useNotifications();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const resolveConfig = useCallback(
    (notification: Notification): NotificationHandlerConfig | undefined =>
      getNotificationHandler(notification.type),
    []
  );

  const contextFor = useCallback(
    (notification: Notification, config?: NotificationHandlerConfig) => ({
      notification,
      navigate,
      t,
      data: config?.data ? config.data(notification) : undefined,
    }),
    [navigate, t]
  );

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleItemClick = (notification: Notification) => {
    markAsRead(String(notification.id ?? ''))
    const config = resolveConfig(notification);
    if (config?.action) config.action(contextFor(notification, config));
    setOpen(false);

  };

  const renderTitle = (notification: Notification): string => {
    const config = resolveConfig(notification);
    const ctx = contextFor(notification, config);
    const title = typeof config?.title === 'function' ? config.title(ctx) : config?.title;
    return title || fallbackTitle(notification);
  };

  const renderDescription = (notification: Notification): string => {
    const config = resolveConfig(notification);
    const ctx = contextFor(notification, config);
    const description = typeof config?.description === 'function' ? config.description(ctx) : config?.description;
    return description ?? '';
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => {
          setOpen((prev) => !prev);
          if (error) clearError();
        }}
        className="relative p-1.5 rounded-md hover:bg-primary transition-colors cursor-pointer group"
        aria-label={t('topbar.notifications', 'shared')}
      >
        <Bell size={20} className="text-text group-hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full inset-e-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-bold text-text">
              {t('notifications.title', 'shared') || 'Notifications'}
            </span>
            <button
              type="button"
              onClick={() => {
                void markAllAsRead();
                setOpen(false);
              }}
              disabled={unreadCount === 0}
              className={`flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${unreadCount === 0
                  ? 'text-text-muted/50 cursor-not-allowed'
                  : 'text-primary hover:text-primary-dark'
                }`}
            >
              <CheckCheck size={14} />
              {t('notifications.mark_all_read', 'shared') || 'Mark all as read'}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-text-muted">
                {t('common.loading', 'shared') || 'Loading...'}
              </div>
            )}

            {!loading && error && notifications.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-text-muted mb-2">
                  {t('notifications.error', 'shared') || 'Failed to load notifications'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void getNotifications();
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {t('common.retry', 'shared') || 'Retry'}
                </button>
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-text-muted">
                {t('notifications.empty', 'shared') || 'No notifications'}
              </div>
            )}

            {notifications.map((notification) => {
              const title = renderTitle(notification);
              const description = renderDescription(notification);
              const isUnread = !notification.read_at;
              return (
                <button
                  key={String(notification.id)}
                  type="button"
                  onClick={() => handleItemClick(notification)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-start border-b border-border/50 last:border-b-0 transition-colors hover:bg-primary-light/40 cursor-pointer ${isUnread ? 'bg-primary-light/20' : ''
                    }`}
                >
                  <span
                    className={`mt-1.5 shrink-0 w-2 h-2 rounded-full ${isUnread ? 'bg-gold' : 'bg-text-muted/30'}`}
                  />
                  <span className="flex-1 min-w-0">
                    <span
                      className={`block text-sm truncate ${isUnread ? 'font-bold text-text' : 'font-medium text-text-muted'}`}
                    >
                      {title || t('notifications.title', 'shared') || 'Notification'}
                    </span>
                    {description && (
                      <span className="block text-xs text-text-muted truncate mt-0.5">{description}</span>
                    )}
                    <span className="block text-[10px] text-text-muted/70 mt-1">
                      {formatRelativeTime(typeof notification.created_at === 'string' ? notification.created_at : undefined, language)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}