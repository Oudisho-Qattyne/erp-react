import { Link, useLocation } from 'react-router-dom';
import { useState, useCallback } from 'react';
import type { NavGroup, NavItem } from '../../../../moduleRegistry';
import { useLanguage } from '../../../context/i18n/I18nProvider';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';

interface NavGroupItemProps {
  group: NavGroup & { items: NavItem[] };
  collapsed: boolean;
  unreadCount?: number;
}

export function NavGroupItem({ group, collapsed, unreadCount = 0 }: NavGroupItemProps) {
  const { t, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const showLabel = group.label && group.id !== 'main';
  const hasIcon = !!group.icon;

  const groupModule = group.moduleName || group.id;
  const moduleLabel = t(`navigation.${group.label}`, groupModule);
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
        <NavItemRenderer
          key={item.id}
          item={item}
          collapsed={collapsed}
          depth={0}
          unread={item.id === 'notifications' ? unreadCount : undefined}
        />
      ))}
    </div>
  );
}

function NavItemRenderer({
  item,
  collapsed,
  depth,
  unread,
}: {
  item: NavItem;
  collapsed: boolean;
  depth: number;
  unread?: number;
}) {
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <NavItemLink item={item} collapsed={collapsed} depth={depth} unread={unread} />
    );
  }

  return (
    <NavItemParent item={item} collapsed={collapsed} depth={depth} unread={unread} />
  );
}

function NavItemParent({
  item,
  collapsed,
  depth,
  unread,
}: {
  item: NavItem;
  collapsed: boolean;
  depth: number;
  unread?: number;
}) {
  const { t, direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const location = useLocation();
  const pathname = location.pathname;

  const hasActiveChild = item.children?.some(c => {
    if (pathname === c.href) return true
    return c.children?.some(gc => pathname === gc.href) ?? false
  }) ?? false;

  const [expanded, setExpanded] = useState(() => hasActiveChild);

  const toggle = useCallback(() => setExpanded(v => !v), []);

  const itemModule = item.moduleName || item.group;
  const moduleLabel = t(`navigation.${item.label}`, itemModule);
  const key = item.id.includes('-') ? item.id.split('-').pop()! : item.id;
  const sharedLabel = t(`sidebar.${key}`, 'shared');
  const finalLabel =
    moduleLabel !== `navigation.${item.label}`
      ? moduleLabel
      : sharedLabel !== `sidebar.${key}`
        ? sharedLabel
        : item.label;

  if (collapsed) {
    return (
      <div className="relative">
        <button
          onClick={toggle}
          className="flex items-center justify-center py-2 px-0 w-full rounded-md transition-all duration-150 text-white/45 hover:bg-white/5 hover:text-white/70"
          title={finalLabel}
        >
          <span className="shrink-0">{item.icon}</span>
        </button>
        {expanded && (
          <div
            className={`absolute ${isRTL ? 'right-full mr-2' : 'left-full ml-2'} top-0 bg-primary-dark border border-white/10 rounded-lg p-2 min-w-45 z-50 shadow-xl`}
          >
            {item.children?.map(child => (
              <NavItemLink key={child.id} item={child} collapsed={false} depth={0} unread={undefined} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={toggle}
        className={`w-full flex items-center gap-2 rounded-md transition-all duration-150 px-3 py-2 ${
          hasActiveChild
            ? 'bg-gold/10 text-gold'
            : 'text-white/45 hover:bg-white/5 hover:text-white/70'
        }`}
      >
        <span className="shrink-0">{item.icon}</span>
        <span className={`text-sm font-medium flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>{finalLabel}</span>
        <span className="shrink-0 transition-transform duration-200">
          {expanded ? <ChevronDown className="w-4 h-4" /> : isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>
      {expanded && (
        <div
          className={`${isRTL ? 'mr-3 border-r' : 'ml-3 border-l'} border-white/10 ${isRTL ? 'pr-2' : 'pl-2'} mt-1 space-y-1`}
        >
          {item.children?.map(child => (
            <NavItemRenderer
              key={child.id}
              item={child}
              collapsed={collapsed}
              depth={depth + 1}
              unread={undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NavItemLink({
  item,
  collapsed,
  depth,
  unread,
}: {
  item: NavItem;
  collapsed: boolean;
  depth: number;
  unread?: number;
}) {
  const location = useLocation();
  const pathname = location.pathname;
  const { t, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const isActive = pathname === item.href;

  const itemModule = item.moduleName || item.group;
  const moduleLabel = itemModule ? t(`navigation.${item.label}`, itemModule) : item.label;
  const key = item.id.includes('-') ? item.id.split('-').pop()! : item.id;
  const sharedLabel = t(`sidebar.${key}`, 'shared');

  const finalLabel =
    moduleLabel !== `navigation.${item.label}`
      ? moduleLabel
      : sharedLabel !== `sidebar.${key}`
        ? sharedLabel
        : item.label;

  const paddingClass = collapsed ? 'justify-center' : depth > 0 ? (isRTL ? 'pr-6' : 'pl-6') : 'px-3';
  const borderClass = isActive ? (isRTL ? 'border-l-2 border-gold' : 'border-r-2 border-gold') : '';

  return (
    <Link
      to={item.href}
      className={`
        flex items-center gap-2 rounded-md transition-all duration-150 relative
        ${collapsed ? 'justify-center py-2 px-0' : `${paddingClass} py-2 justify-start`}
        ${isActive
          ? `bg-gold/10 text-gold ${borderClass}`
          : 'text-white/45 hover:bg-white/5 hover:text-white/70'
        }
      `}
      title={collapsed ? finalLabel : undefined}
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && <span className="text-sm font-medium">{finalLabel}</span>}
      {unread && unread > 0 && (
        <span
          className={`
            absolute top-1 w-2 h-2 rounded-full bg-danger border-2 border-primary-dark
            ${collapsed ? (isRTL ? 'right-7' : 'left-7') : (isRTL ? '-left-2' : '-right-2')}
          `}
        />
      )}
    </Link>
  );
}
