import type Echo from 'laravel-echo'
import type { MessageEventData, ConversationEventData } from '../dtos/chatEventData'

let userChannelSubscribed = false
let onlineChannelSubscribed = false

export interface ChatEchoCallbacks {
  onMessageSent: (data: MessageEventData) => void
  onConversationMessageSent: (data: MessageEventData) => void
  onMessageRead: (data: MessageEventData) => void
  onConversationRead: (data: ConversationEventData) => void
  onConversationCreated: (data: ConversationEventData) => void
  onOnlineHere: (users: { id: number; name: string }[]) => void
  onOnlineJoining: (user: { id: number; name: string }) => void
  onOnlineLeaving: (user: { id: number; name: string }) => void
}

export const subscribeUserChannel = (
  echo: Echo<'pusher'>,
  currentUserId: number,
  cbRef: { current: ChatEchoCallbacks },
) => {
  if (userChannelSubscribed) return
  userChannelSubscribed = true

  const userChannel = echo.private(`conversations.${currentUserId}`)
  userChannel.error((error : any) => { console.log("userChannel error:", error) })

  userChannel.listen('.message.sent', (data: MessageEventData) => {
    cbRef.current.onConversationMessageSent(data)
  })
  userChannel.listen('.conversation.read', (data: ConversationEventData) => {
    cbRef.current.onConversationRead(data)
  })
  userChannel.listen('.conversation.created', (data: ConversationEventData) => {
    cbRef.current.onConversationCreated(data)
  })
}

export const subscribeOnlineChannel = (
  echo: Echo<'pusher'>,
  cbRef: { current: ChatEchoCallbacks },
) => {
  if (onlineChannelSubscribed) return
  onlineChannelSubscribed = true

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
}

export interface MessageChannelUseCase {
  subscribe: (conversationId: number) => void
  unsubscribe: () => void
  destroy: () => void
}

export const createMessageChannelUseCase = (
  echo: Echo<'pusher'>,
  cbRef: { current: ChatEchoCallbacks },
): MessageChannelUseCase => {
  let channelName: string | null = null

  return {
    subscribe(conversationId: number) {
      if (channelName) {
        echo.leave(channelName)
        channelName = null
      }

      const name = `private-messages.${conversationId}`
      channelName = name

      const channel = echo.private(`messages.${conversationId}`)
      channel.error((error : any) => { console.log("messageChannel error:", error) })
      channel.listen('.message.sent', (data: MessageEventData) => {
        cbRef.current.onMessageSent(data)
      })
      channel.listen('.message.read', (data: MessageEventData) => {
        cbRef.current.onMessageRead(data)
      })
    },

    unsubscribe() {
      if (channelName) {
        echo.leave(channelName)
        channelName = null
      }
    },

    destroy() {
      this.unsubscribe()
    },
  }
}
