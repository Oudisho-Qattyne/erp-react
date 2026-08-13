import type { NavigateFunction } from 'react-router-dom';
import type { Notification } from '../../domain/entities/notification/notification';

export interface NotificationHandlerContext {
  notification: Notification;
  navigate: NavigateFunction;
  t: (key: string, moduleName?: string) => string;
  /** Typed data from the matched handler's `data` extractor (undefined when none registered) */
  data: unknown;
}

export interface NotificationHandlerConfig {
  title?: string | ((ctx: NotificationHandlerContext) => string);
  description?: string | ((ctx: NotificationHandlerContext) => string);
  action?: (ctx: NotificationHandlerContext) => void;
  /** Typed payload accessor specific to this notification type */
  data?: (notification: Notification) => unknown;
}

const notificationHandlers: Record<string, NotificationHandlerConfig> = {};

export const registerNotificationHandler = (type: string, config: NotificationHandlerConfig): void => {
  notificationHandlers[type] = config;
};

export const getNotificationHandler = (
  type: string | undefined
): NotificationHandlerConfig | undefined => (type ? notificationHandlers[type] : undefined);

export const getNotificationApi = () => ({
  getNotificationHandler,
  registerNotificationHandler,
});