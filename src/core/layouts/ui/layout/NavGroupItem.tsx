'use client';

import { NavGroup, NavItem } from '@/modules/registry';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DynamicIcon } from '../icons/DynamicIcon';
import { useLanguage } from '../../../context/LanguageContext';

interface NavGroupItemProps {
  group: NavGroup & { items: NavItem[] };
  collapsed: boolean;
  unreadCount?: number;
}

export function NavGroupItem({ group, collapsed, unreadCount = 0 }: NavGroupItemProps) {
  const { t } = useLanguage();
  // For the "main" group (dashboard) we don't show a label
  const showLabel = group.label && group.id !== 'main';
  
  // Try module-specific translation first, then shared sidebar key
  const moduleLabel = t(`navigation.${group.label}`, group.id);
  const sharedLabel = t(`sidebar.${group.id}`, 'shared');
  
  const finalGroupLabel = moduleLabel !== `navigation.${group.label}` 
    ? moduleLabel 
    : (sharedLabel !== `sidebar.${group.id}` ? sharedLabel : group.label);

  return (
    <div className="mb-2">
      {/* Group header (only when expanded) */}
      {!collapsed && showLabel && (
        <div className="text-[8px] font-bold text-white/20 px-3 pt-3 pb-1 uppercase tracking-wider">
          {finalGroupLabel}
        </div>
      )}
      {/* Separator line when collapsed and group has label */}
      {collapsed && showLabel && <div className="h-px bg-white/10 my-2 mx-2" />}

      {/* Group items */}
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

// Internal component for a single nav link
function NavItemLink({
  item,
  collapsed,
  unread,
}: {
  item: NavItem;
  collapsed: boolean;
  unread?: number;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

  // Try module-specific navigation key first (e.g., hr:navigation.employees)
  // then shared sidebar key (e.g., shared:sidebar.employees)
  const moduleLabel = item.group ? t(`navigation.${item.label}`, item.group) : item.label;
  
  const key = item.id.includes('-') ? item.id.split('-').pop() : item.id;
  const sharedLabel = t(`sidebar.${key}`, 'shared');
  
  const finalLabel = (moduleLabel !== `navigation.${item.label}`)
    ? moduleLabel
    : (sharedLabel !== `sidebar.${key}` ? sharedLabel : item.label);

  return (
    <Link
      href={item.href}
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
      <DynamicIcon name={item.icon} size={18} className="shrink-0" />
      {!collapsed && <span className="text-sm font-medium">{finalLabel}</span>}
      {unread && unread > 0 && (
        <span className={`
          absolute top-1 w-2 h-2 rounded-full bg-danger border-2 border-primary-dark
          ${collapsed ? 'left-7' : 'left-auto -right-2'}
        `} />
      )}
    </Link>
  );
}