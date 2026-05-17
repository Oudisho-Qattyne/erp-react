import { Menu, Bell, LayoutDashboard } from 'lucide-react';
import { useSidebar } from '../../../context/SidebarContext';
import { useLanguage } from '../../../context/LanguageContext';

interface TopBarProps {
  title: string;
  icon?: React.ReactNode;
  unreadNotifications?: number;
  onNotificationClick?: () => void;
  user: {
    full_name: string;
    position?: string;
    role: string;
  };
}

import { ThemeToggle } from './ThemeToggle';

export function TopBar({
  title,
  icon = <LayoutDashboard size={18} className="text-primary" />,
  unreadNotifications = 0,
  onNotificationClick,
  user,
}: TopBarProps) {
  const { toggleCollapsed } = useSidebar();
  const { t } = useLanguage();

  return (
    <header className="bg-card border-b border-border h-14 px-5 flex items-center justify-between shrink-0">
      {/* Left side: mobile menu toggle + page title */}
      <div className="flex items-center gap-3">
        {/* Hamburger button for mobile (visible only on small screens) */}
        <button
          onClick={toggleCollapsed}
          className="lg:hidden p-1 rounded-md hover:bg-primary-light transition-colors"
          aria-label={t('topbar.toggle_sidebar', 'shared')}
        >
          <Menu size={20} className="text-text" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-gold rounded-full shadow-[0_0_8px_rgba(var(--color-gold),0.5)]" />
          <h1 className="text-lg font-black text-text flex items-center gap-2.5 tracking-tight">
            {icon}
            <span>{title}</span>
          </h1>
        </div>
      </div>

      {/* Right side: notifications + user info */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {/* Notifications button */}
        {onNotificationClick && (
          <button
            onClick={onNotificationClick}
            className="relative p-1.5 rounded-md hover:bg-primary-light transition-colors"
            aria-label={t('topbar.notifications', 'shared')}
          >
            <Bell size={20} className="text-text" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
        )}

        {/* User info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white text-sm font-bold shadow">
            {user.full_name?.[0] === 'م'
              ? user.full_name?.[2] || user.full_name[0]
              : user.full_name?.[0] || 'U'}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-text">{user.full_name}</div>
            <div className="text-[10px] text-text-muted">
              {user.position || (user.role === 'admin' ? t('common.admin', 'shared') : t('common.user', 'shared'))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}