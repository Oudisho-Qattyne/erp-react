import type { ReactNode } from 'react'
import MainNav from './ui/navs/MainNav'
import { Sidebar } from './ui/layout/Sidebar'
import { TopBar } from './ui/layout/TopBar';
import { useLanguage } from '../context/i18n/I18nProvider';
import { getAuthUser } from '../../infrastructure/auth/authStorage';

const DefaultLayout = ({ children }: { children: ReactNode }) => {
  const user = getAuthUser()
  const currentUser = {
  full_name: user?.name,
  position: user?.role.display_name,
  role: user?.role.name,
};
const { direction, t } = useLanguage();


  return (
    <div className="min-h-screen">
      <div className="flex h-screen bg-background" dir={direction}>
        <Sidebar user={currentUser} unreadNotifications={2} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar
            unreadNotifications={2}
            onNotificationClick={() => alert('Notifications clicked')}
            user={currentUser}
          />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default DefaultLayout