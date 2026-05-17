'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItemProps {
  id: string;
  label: string;
  icon: string;
  href: string;
  unread?: number;
  collapsed: boolean;
  onClick?: () => void;
}

import { useLanguage } from '../../../context/LanguageContext';

export function NavItem({ id, label, icon, href, unread, collapsed, onClick }: NavItemProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const isActive = pathname === href || pathname?.startsWith(href + '/');

  const key = id.includes('-') ? id.split('-').pop() : id;
  const translatedLabel = t(`sidebar.${key}`, 'shared');
  const finalLabel = translatedLabel !== `sidebar.${key}` ? translatedLabel : label;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-2 rounded-md transition-all duration-150
        ${collapsed ? 'justify-center py-2 px-0' : 'px-3 py-2 justify-start'}
        ${isActive 
          ? 'bg-gold/10 text-gold border-r-2 border-gold' 
          : 'text-white/45 hover:bg-white/5 hover:text-white/70'
        }
      `}
      title={collapsed ? finalLabel : undefined}
    >
      <span className="text-base shrink-0">{icon}</span>
      {!collapsed && <span className="text-sm font-medium">{finalLabel}</span>}
      {unread && unread > 0 && (
        <span className={`
          absolute top-1 left-7 w-2 h-2 rounded-full bg-danger border-2 border-primary-dark
          ${collapsed ? 'left-7' : 'left-auto -right-2'}
        `} />
      )}
    </Link>
  );
}