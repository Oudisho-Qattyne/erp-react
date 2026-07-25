import { registerChatApi, type ChatApi } from '../../core/registry/chat/chatRegistry';
import { ChatFloatingButton } from './presentation/components/ChatFloatingButton';
import type { Module } from '../../core/moduleRegistry';

const createChatApi = (): ChatApi => ({
  ChatFloatingButtonComponent: ChatFloatingButton,
});

const chatApi = createChatApi();
registerChatApi(chatApi);

const chatModule: Module = {
  name: 'chat',
  routes: [],
  locales: {},
};

export default chatModule;
