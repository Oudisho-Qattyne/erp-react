// src/core/components/MainNav.tsx
import { NavLink } from 'react-router-dom'
import { getNavGroups, getNavItems, type NavItem } from '../../../moduleRegistry'

const MainNav = () => {
  const navItems = getNavItems()
  const groups = getNavGroups()

  const itemsByGroup = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {} as Record<string, NavItem[]>)

  return (
    <nav className="space-y-6">
      {groups.map(group => {
        const items = itemsByGroup[group.id] || []
        if (items.length === 0) return null
        return (
          <div key={group.id}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {group.label}
            </h3>
            <ul className="space-y-1">
              {items.map(item => (
                <li key={item.id}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`
                    }
                  >
                    {/* Render icon as React node */}
                    <span className="w-5 h-5 flex items-center justify-center">
                      {item.icon || <span className="text-lg">🔗</span>}
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

export default MainNav