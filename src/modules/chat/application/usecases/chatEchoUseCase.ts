import type Echo from 'laravel-echo'
import type { MessageEventData, ConversationEventData } from '../dtos/chatEventData'

export interface ChatEchoCallbacks {
  onMessageSent: (data: MessageEventData) => void
  onMessageRead: (data: MessageEventData) => void
  onConversationRead: (data: ConversationEventData) => void
  onConversationCreated: (data: ConversationEventData) => void
}

export interface ChatEchoUseCase {
  subscribeToMessages: (conversationId: number) => void
  unsubscribeFromMessages: () => void
  destroy: () => void
}

export const createChatEchoUseCase = (
  echo: Echo<'pusher'>,
  currentUserId: number,
  callbacks: ChatEchoCallbacks,
): ChatEchoUseCase => {
  const cbRef = { current: callbacks }
  cbRef.current = callbacks

  let messageChannelName: string | null = null

  const userChannelName = `private-conversations.${currentUserId}`
  const userChannel = echo.private(`conversations.${currentUserId}`)
  userChannel.error(() => {})

  userChannel.listen('.conversation.read', (data: ConversationEventData) => {
    cbRef.current.onConversationRead(data)
  })
  userChannel.listen('.conversation.created', (data: ConversationEventData) => {
    cbRef.current.onConversationCreated(data)
  })

  return {
    subscribeToMessages(conversationId: number) {
      if (messageChannelName) {
        echo.leave(messageChannelName)
        messageChannelName = null
      }

      const channelName = `private-messages.${conversationId}`
      messageChannelName = channelName

      const channel = echo.private(`messages.${conversationId}`)
      channel.error(() => {})
      channel.listen('.message.sent', (data: MessageEventData) => {
        cbRef.current.onMessageSent(data)
      })
      channel.listen('.message.read', (data: MessageEventData) => {
        cbRef.current.onMessageRead(data)
      })
    },

    unsubscribeFromMessages() {
      if (messageChannelName) {
        echo.leave(messageChannelName)
        messageChannelName = null
      }
    },

    destroy() {
      this.unsubscribeFromMessages()
      echo.leave(userChannelName)
    },
  }
}
