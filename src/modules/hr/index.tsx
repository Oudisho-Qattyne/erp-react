// import UsersPage from './presentation/pages/UsersPage'
import enLocales from './presentation/locales/en.json'
import arLocales from './presentation/locales/ar.json'
import { Users } from 'lucide-react'   // or any icon component
import type { Module } from '../../core/moduleRegistry'
// import CreateUserPage from './presentation/pages/CreateUserPage'
import { ReportsPage } from './presentation/pages/ReportsPage'

const usersModule: Module = {
  name: 'hr',
  routes: [
    {
      path: '/hr',
      element: <ReportsPage />,
      layout: 'dashboard',
      label: 'التقارير',
      nav: true,
      order: 10,
      moduleName: 'hr',
      icon: <Users className="w-5 h-5" />,   // 👈 React element
      group: 'hr',
      permission: 'hr:read',
    },
    // {
    //   path: '/hr/create',
    //   element: <CreateUserPage />,
    //   layout: 'dashboard',
    //   label: 'Create User',
    //   nav: true,
    //   moduleName: 'hr',
    //   icon: <Users className="w-5 h-5" />,   // 👈 React element
    //   group: 'hr',
    // },
  ],
  locales: { en: enLocales, ar: arLocales },
  navGroups: [
    { id: 'hr', label: 'الادارة', order: 10 , icon: <Users size={10} className="shrink-0" /> },
  ],
}

export default usersModule