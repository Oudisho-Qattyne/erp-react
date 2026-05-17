import { Link, useLocation } from 'react-router-dom';
import type { NavGroup, NavItem } from '../../../../moduleRegistry';
import { useLanguage } from '../../../context/i18n/I18nProvider';

interface NavGroupItemProps {
  group: NavGroup & { items: NavItem[] };
  collapsed: boolean;
  unreadCount?: number;
}

export function NavGroupItem({ group, collapsed, unreadCount = 0 }: NavGroupItemProps) {
  const { t } = useLanguage();
  const showLabel = group.label && group.id !== 'main';
  const hasIcon = !!group.icon;

  // Translation logic
  const moduleLabel = t(`navigation.${group.label}`, group.id);
  const sharedLabel = t(`sidebar.${group.id}`, 'shared');
  const finalGroupLabel =
    moduleLabel !== `navigation.${group.label}`
      ? moduleLabel
      : sharedLabel !== `sidebar.${group.id}`
        ? sharedLabel
        : group.label;

  return (
    <div className="mb-2">
      {!collapsed && showLabel && (
        <div className="text-[8px] font-bold text-white/20 px-3 pt-3 pb-1 uppercase tracking-wider flex items-center gap-2">
          {hasIcon && <span className="shrink-0">{group.icon}</span>}
          <span>{finalGroupLabel}</span>
        </div>
      )}

      {collapsed && showLabel && (
        <>
          {hasIcon && (
            <div className="flex justify-center my-2">
              {group.icon}
            </div>
          )}
          <div className="h-px bg-white/10 my-2 mx-2" />
        </>
      )}

      {group.items.map((item) => (
        <NavItemLink
          key={item.id}
          item={item}
          collapsed={collapsed}
          unread={item.id === 'notifications' ? unreadCount : undefined}
        />
      ))}
    </div>
  );
}

// NavItemLink remains unchanged, but note it still uses DynamicIcon for item icons.
// If you also want to remove DynamicIcon for items, you can change NavItem.icon to ReactNode similarly.
function NavItemLink({
  item,
  collapsed,
  unread,
}: {
  item: NavItem;
  collapsed: boolean;
  unread?: number;
}) {
  const location = useLocation();
  const pathname = location.pathname;
  const { t } = useLanguage();

  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

  // Translation fallback logic
  const moduleLabel = item.group ? t(`navigation.${item.label}`, item.group) : item.label;
  const key = item.id.includes('-') ? item.id.split('-').pop()! : item.id;
  const sharedLabel = t(`sidebar.${key}`, 'shared');

  const finalLabel =
    moduleLabel !== `navigation.${item.label}`
      ? moduleLabel
      : sharedLabel !== `sidebar.${key}`
        ? sharedLabel
        : item.label;

  return (
    <Link
      to={item.href}
      className={`
        flex items-center gap-2 rounded-md transition-all duration-150 relative
        ${collapsed ? 'justify-center py-2 px-0' : 'px-3 py-2 justify-start'}
        ${isActive
          ? 'bg-gold/10 text-gold border-r-2 border-gold'
          : 'text-white/45 hover:bg-white/5 hover:text-white/70'
        }
      `}
      title={collapsed ? finalLabel : undefined}
    >
      {/* item.icon is already a ReactNode – render directly */}
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span className="text-sm font-medium">{finalLabel}</span>}
      {unread && unread > 0 && (
        <span
          className={`
            absolute top-1 w-2 h-2 rounded-full bg-danger border-2 border-primary-dark
            ${collapsed ? 'left-7' : '-right-2'}
          `}
        />
      )}
    </Link>
  );
}