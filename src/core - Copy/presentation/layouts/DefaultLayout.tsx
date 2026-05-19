import type { ReactNode } from 'react'
import MainNav from './ui/navs/MainNav'
import { Sidebar } from './ui/layout/Sidebar'
import { TopBar } from './ui/layout/TopBar';
import { useLanguage } from '../context/i18n/I18nProvider';

const DefaultLayout = ({ children }: { children: ReactNode }) => {
  const mockUser = {
  full_name: 'م. أحمد الشمري',
  position: 'المدير العام',
  role: 'admin',
};
const { direction, t } = useLanguage();


  return (
    <div className="min-h-screen">
      <div className="flex h-screen bg-background" dir={direction}>
        <Sidebar user={mockUser} unreadNotifications={2} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar
            unreadNotifications={2}
            onNotificationClick={() => alert('Notifications clicked')}
            user={mockUser}
          />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default DefaultLayout