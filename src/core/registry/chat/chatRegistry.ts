export interface ChatApi {
  ChatFloatingButtonComponent?: React.ComponentType;
}

let chatApi: ChatApi | null = null;

export const registerChatApi = (api: ChatApi): void => {
  chatApi = api;
};

export const getChatApi = (): ChatApi | null => {
  return chatApi;
};
