import { NavItem } from './NavItem';

interface NavGroupProps {
  group: { id: string; l: string };
  items: Array<{ id: string; l: string; i: string; href: string }>;
  collapsed: boolean;
  unreadCount?: number; // for notification badge
}

export function NavGroup({ group, items, collapsed, unreadCount = 0 }: NavGroupProps) {
  return (
    <div className="mb-2">
      {!collapsed && group.l && (
        <div className="text-[8px] font-bold text-white/20 px-3 pt-3 pb-1 uppercase tracking-wider">
          {group.l}
        </div>
      )}
      {collapsed && group.l && <div className="h-px bg-white/10 my-2 mx-2" />}
      {items.map((item) => (
        <NavItem
          key={item.id}
          id={item.id}
          label={item.l}
          icon={item.i}
          href={item.href}
          unread={item.id === 'notifications' ? unreadCount : undefined}
          collapsed={collapsed}
        />
      ))}
    </div>
  );
}