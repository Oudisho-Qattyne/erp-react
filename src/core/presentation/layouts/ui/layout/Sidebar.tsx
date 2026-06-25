import { NavBar } from './NavBar';
import { CollapseButton } from './CollapseButton';
import { LogoutButton } from './LogoutButton';
import { LanguageToggle } from './LanguageToggle';

import { Shield } from 'lucide-react';
import { useSidebar } from '../../../context/SidebarContext/SidebarContext';
import { useNavigation } from '../../../hooks/useNavigation';

interface SidebarProps {
  user: {
    full_name: string;
    position?: string;
    role: string;
  };
  unreadNotifications?: number;
}

export function Sidebar({ user, unreadNotifications = 0 }: SidebarProps) {
  const { collapsed } = useSidebar();
  const { navItems, navGroups } = useNavigation();

  return (
    <aside
      className={`
        flex flex-col h-screen bg-primary-dark
        transition-all duration-500 ease-in-out border-l border-gold/20 shrink-0
        ${collapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Logo / Header */}
      <div
        className={`
          flex items-center border-b border-white/10 py-3
          ${collapsed ? 'justify-center px-0' : 'gap-2 px-4'}
        `}
      >
        <div className="w-8 h-8 rounded-md bg-linear-to-br from-gold to-gold-dark flex items-center justify-center text-lg font-black text-primary-dark shadow-md">
          <Shield size={18} fill="currentColor" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-xs font-extrabold text-white tracking-wide">حسياء</div>
            <div className="text-[8px] text-white/40">نظام الإدارة الموحد</div>
          </div>
        )}
      </div>

      {/* Navigation (now separate component) */}
      <NavBar
        navItems={navItems}
        navGroups={navGroups}
        collapsed={collapsed}
        unreadNotifications={unreadNotifications}
      />

      {/* Bottom Section */}
      <div className="border-t border-white/10 pt-2 pb-3 px-2 space-y-1">
        {/* <LanguageToggle collapsed={collapsed} /> */}
        <LogoutButton collapsed={collapsed} />
        <CollapseButton />
      </div>
    </aside>
  );
}