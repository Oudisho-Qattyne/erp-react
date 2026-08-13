import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './ui/layout/Sidebar'
import { TopBar } from './ui/layout/TopBar';
import { useLanguage } from '../context/i18n/I18nProvider';
import { getAuthUser } from '../../infrastructure/auth/authStorage';
import { getChatApi } from '../../registry/chat/chatRegistry';

const HIDDEN_CHAT_ROUTES = ['/auth', '/unauthorized'];

const DefaultLayout = ({ children }: { children: ReactNode }) => {
  const user = getAuthUser()
  const currentUser = {
    full_name: user?.name,
    position: user?.role?.display_name,
    role: user?.role?.name,
  };
  const { direction } = useLanguage();
  const location = useLocation();
  const chatApi = getChatApi();
  const ChatButton = chatApi?.ChatFloatingButtonComponent;
  const chatEnabled = import.meta.env.VITE_ENABLE_CHAT === 'true';
  const showChat = chatEnabled && !!ChatButton && !HIDDEN_CHAT_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen">
      <div className="flex h-screen bg-background" dir={direction}>
        <Sidebar user={currentUser} unreadNotifications={2} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar user={currentUser} />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
      {showChat && <ChatButton />}
    </div>
  )
}

export default DefaultLayout
