import React, { createContext, useContext, type ReactNode } from 'react';
import { getChatApi, type ChatApi } from './chatRegistry';

const ChatContext = createContext<ChatApi | null>(null);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const api = getChatApi();
  return (
    <ChatContext.Provider value={api}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  return useContext(ChatContext);
};
