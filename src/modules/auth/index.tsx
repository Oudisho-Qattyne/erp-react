import enLocales from './presentation/locales/en.json'
import arLocales from './presentation/locales/ar.json'
import { Users } from 'lucide-react'   // or any icon component
import type { Module } from '../../core/moduleRegistry'
import LoginPage from './presentation/components/Login'

const usersModule: Module = {
  name: 'auth',
  routes: [
    {
      path: '/auth',
      element: <LoginPage />,
      layout: 'none',
      label: 'Auth',
      nav: false,
      moduleName: 'auth',
      requiresAuth:false
    },
  
  ],
  locales: { en: enLocales, ar: arLocales },
  // navGroups: [
  //   { id: 'userManagement', label: 'User Management', order: 10 , icon: <Users size={10} className="shrink-0" /> },
  // ],
}

export default usersModule