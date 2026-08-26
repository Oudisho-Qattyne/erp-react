import type Echo from 'laravel-echo'

let notificationChannelSubscribed = false

export interface BroadcastNotificationData {
  id: string
  type: string
  transaction_id?: string
  payload?: Record<string, unknown>
  [key: string]: unknown
}

export interface NotificationEchoCallbacks {
  onBroadcastNotification: (data: BroadcastNotificationData) => void
}

export const subscribeNotificationChannel = (
  echo: Echo<'pusher'>,
  currentUserId: number,
  cbRef: { current: NotificationEchoCallbacks },
): void => {
  if (notificationChannelSubscribed) return
  notificationChannelSubscribed = true

  const channel = echo.private(`notifications.${currentUserId}`)
  console.log('[notifications echo] subscribing to channel:', `notifications.${currentUserId}`)
  channel.error((error: any) => { console.log('[notifications echo] channel error:', error) })

  channel.notification((notification: BroadcastNotificationData) => {
    console.log('[notifications echo] received broadcast notification:', notification)
    cbRef.current.onBroadcastNotification(notification)
  })

  channel.listenToAll((event: string, data: unknown) => {
    console.log('[notifications echo] received event:', event, data)
  })
}