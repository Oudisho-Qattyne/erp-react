import UsersPage from './presentation/pages/UsersPage'
import CreateUserPage from './presentation/pages/CreateUserPage'
import enLocales from './locales/en.json'
import arLocales from './locales/ar.json'
import type { Module } from '../../core/moduleRegistry'

export const usersModule: Module = {
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
    },
    {
      path: '/users/create',
      element: <CreateUserPage />,
      layout: 'dashboard',
      label: 'Create User',
      nav: false,
      moduleName: 'users',
    },
  ],
  locales: {
    en: enLocales,
    ar: arLocales,
  },
}

export default usersModule