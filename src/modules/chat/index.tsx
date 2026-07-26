import { registerChatApi, type ChatApi } from '../../core/registry/chat/chatRegistry';
import { ChatFloatingButton } from './presentation/components/ChatFloatingButton';
import type { Module } from '../../core/moduleRegistry';
import enLocales from './presentation/locales/en.json';
import arLocales from './presentation/locales/ar.json';

const createChatApi = (): ChatApi => ({
  ChatFloatingButtonComponent: ChatFloatingButton,
});

const chatApi = createChatApi();
registerChatApi(chatApi);

const chatModule: Module = {
  name: 'chat',
  routes: [],
  locales: { en: enLocales, ar: arLocales },
};

export default chatModule;
