import { useEffect, useState } from 'react';
import { getNavGroups, getNavItems, type NavGroup, type NavItem } from '../../moduleRegistry';
import { useAuth } from '../../infrastructure/auth/AuthProvider';

export function useNavigation() {
  const { user } = useAuth();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [navGroups, setNavGroups] = useState<NavGroup[]>([]);

  useEffect(() => {
    let items = getNavItems();
    const groups = getNavGroups();

    items = items.filter((item: NavItem) => {
      if (!item.permission) return true;
      const perms = Array.isArray(item.permission) ? item.permission : [item.permission];
      return perms.some(p => user?.permissions?.includes(p) ?? false);
    });

    setNavItems(items);
    setNavGroups(groups);
  }, [user]);

  return { navItems, navGroups };
}