import UsersPage from './presentation/pages/UsersPage'
import enLocales from './locales/en.json'
import arLocales from './locales/ar.json'
import { Users } from 'lucide-react'   // or any icon component
import type { Module } from '../../core/moduleRegistry'
import CreateUserPage from './presentation/pages/CreateUserPage'

const usersModule: Module = {
  name: 'users',
  routes: [
    {
      path: '/users',
      element: <UsersPage />,
      layout: 'dashboard',
      label: 'Users',
      nav: true,
      order: 10,
      moduleName: 'users',
      icon: <Users className="w-5 h-5" />,   // 👈 React element
      group: 'userManagement',
      permission: 'users:read',
    },
    {
      path: '/users/create',
      element: <CreateUserPage />,
      layout: 'dashboard',
      label: 'Create User',
      nav: true,
      moduleName: 'users',
      icon: <Users className="w-5 h-5" />,   // 👈 React element
      group: 'userManagement',
    },
  ],
  locales: { en: enLocales, ar: arLocales },
  navGroups: [
    { id: 'userManagement', label: 'User Management', order: 10 , icon: <Users size={10} className="shrink-0" /> },
  ],
}

export default usersModule