import { NavLink } from 'react-router-dom'
import { getNavItems } from '../../moduleRegistry'

const MainNav = () => {
  const navItems = getNavItems()

  return (
    <nav className="flex gap-4">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `px-3 py-2 rounded-md transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default MainNav