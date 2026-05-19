import { useEffect, useState } from 'react';
import { getNavGroups, getNavItems, type NavGroup, type NavItem } from '../../moduleRegistry';

export function useNavigation(role?: string) {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [navGroups, setNavGroups] = useState<NavGroup[]>([]);

  useEffect(() => {
    let items = getNavItems();
    const groups = getNavGroups();

    // Filter based on role (optional)
    if (role !== 'admin') {
      items = items.filter((item : NavItem) => item.permission !== 'admin');
    }

    setNavItems(items);
    setNavGroups(groups);
  }, [role]);

  return { navItems, navGroups };
}