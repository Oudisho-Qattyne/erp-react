import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../../context/i18n/I18nProvider';

interface NavItemProps {
  id: string;
  label: string;
  icon: string;
  href: string;
  unread?: number;
  collapsed: boolean;
  onClick?: () => void;
}

export function NavItem({ id, label, icon, href, unread, collapsed, onClick }: NavItemProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const { t } = useLanguage();

  const isActive = pathname === href || pathname.startsWith(href + '/');

  // Use the last segment of id as the translation key (e.g., "dashboard" from "nav-dashboard")
  const key = id.includes('-') ? id.split('-').pop()! : id;
  const translatedLabel = t(`sidebar.${key}`, 'shared');
  const finalLabel = translatedLabel !== `sidebar.${key}` ? translatedLabel : label;

  return (
    <Link
      to={href}
      onClick={onClick}
      className={`
        relative flex items-center gap-2 rounded-md transition-all duration-150
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
        <span
          className={`
            absolute w-2 h-2 rounded-full bg-danger border-2 border-primary-dark
            ${collapsed ? 'top-1 left-7' : 'top-1 -right-2'}
          `}
        />
      )}
    </Link>
  );
}