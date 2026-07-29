import type Echo from 'laravel-echo'
import type { MessageEventData, ConversationEventData } from '../dtos/chatEventData'

export interface ChatEchoCallbacks {
  onMessageSent: (data: MessageEventData) => void
  onMessageRead: (data: MessageEventData) => void
  onConversationRead: (data: ConversationEventData) => void
  onConversationCreated: (data: ConversationEventData) => void
  onOnlineHere: (users: { id: number; name: string }[]) => void
  onOnlineJoining: (user: { id: number; name: string }) => void
  onOnlineLeaving: (user: { id: number; name: string }) => void
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
  userChannel.error((error : any) => {console.log("userChannel error:", error)})

  userChannel.listen('.conversation.read', (data: ConversationEventData) => {
    cbRef.current.onConversationRead(data)
  })
  userChannel.listen('.conversation.created', (data: ConversationEventData) => {
    cbRef.current.onConversationCreated(data)
  })

  const onlineChannel = echo.join('online')
  onlineChannel.here((members: any[]) => {
    cbRef.current.onOnlineHere(members)
  })
  onlineChannel.joining((member: any) => {
    cbRef.current.onOnlineJoining(member)
  })
  onlineChannel.leaving((member: any) => {
    cbRef.current.onOnlineLeaving(member)
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
      channel.error((error : any) => {console.log("messageChannel error:", error)})
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
      echo.leave('online')
    },
  }
}
