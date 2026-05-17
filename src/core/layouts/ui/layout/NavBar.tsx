'use client';

import { NavGroupItem } from './NavGroupItem';

interface NavBarProps {
  navItems: any[];        // typed as NavItem[]
  navGroups: any[];       // typed as NavGroup[]
  collapsed: boolean;
  unreadNotifications?: number; // only for the 'adm' group
}

export function NavBar({ navItems, navGroups, collapsed, unreadNotifications = 0 }: NavBarProps) {
  // Group items by group id
  const grouped = navGroups
    .map((group) => ({
      ...group,
      items: navItems.filter((item) => item.group === group.id),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
      {grouped.map((group) => (
        <NavGroupItem
          key={group.id}
          group={group}
          collapsed={collapsed}
          unreadCount={group.id === 'adm' ? unreadNotifications : 0}
        />
      ))}
    </nav>
  );
}