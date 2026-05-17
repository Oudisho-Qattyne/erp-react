import type { ReactNode } from 'react'
import MainNav from './components/MainNav'
import { Sidebar } from './ui/layout/Sidebar'
import { TopBar } from './ui/layout/TopBar';

const DefaultLayout = ({ children }: { children: ReactNode }) => {
  const mockUser = {
  full_name: 'م. أحمد الشمري',
  position: 'المدير العام',
  role: 'admin',
};

  return (
    <div className="min-h-screen">
     <Sidebar user={mockUser} unreadNotifications={2} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar
            // title={title}
            // icon={icon}
            unreadNotifications={2}
            onNotificationClick={() => alert('Notifications clicked')}
            user={mockUser}
          />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
    </div>
  )
}

export default DefaultLayout