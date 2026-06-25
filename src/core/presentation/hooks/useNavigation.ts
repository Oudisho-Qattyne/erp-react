import { useEffect, useState } from 'react';
import { getNavGroups, getNavItems, type NavGroup, type NavItem } from '../../moduleRegistry';
import { useAuth } from '../../infrastructure/auth/AuthProvider';

export function useNavigation() {
  const { user } = useAuth();
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [navGroups, setNavGroups] = useState<NavGroup[]>([]);

  const filterByPermission = (items: NavItem[]): NavItem[] => {
    return items
      .map(item => ({
        ...item,
        children: item.children ? filterByPermission(item.children) : undefined,
      }))
      .filter(item => {
        if (item.children && item.children.length > 0) return true
        if (!item.permission) return true
        const perms = Array.isArray(item.permission) ? item.permission : [item.permission]
        return perms.some(p => user?.permissions?.includes(p) ?? false)
      })
  }

  useEffect(() => {
    let items = getNavItems();
    const groups = getNavGroups();
    items = filterByPermission(items);
    setNavItems(items);
    setNavGroups(groups);
  }, [user]);

  return { navItems, navGroups };
}