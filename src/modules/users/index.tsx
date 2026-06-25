import enLocales from './presentation/locales/en.json'
import arLocales from './presentation/locales/ar.json'
import { Shield } from 'lucide-react'
import type { Module } from '../../core/moduleRegistry'
import { RolesListPage } from './presentation/pages/RolesListPage'
import { EditRolePage } from './presentation/pages/EditRolePage'
import { ShowRolePage } from './presentation/pages/ShowRolePage'

const usersModule: Module = {
  name: 'users',
  routes: [
    {
      path: '/users/roles',
      element: <RolesListPage />,
      layout: 'dashboard',
      label: 'roles.title',
      nav: true,
      order: 50,
      moduleName: 'users',
      icon: <Shield size={18} />,
      group: 'users',
      requiredPermission: 'users.roles.list',
    },
    {
      path: '/users/roles/:id',
      element: <ShowRolePage />,
      layout: 'dashboard',
      label: 'show_role.title',
      nav: false,
      moduleName: 'users',
      requiredPermission: 'users.roles.view',
    },
    {
      path: '/users/roles/:id/edit',
      element: <EditRolePage />,
      layout: 'dashboard',
      label: 'edit_role.title',
      nav: false,
      moduleName: 'users',
      requiredPermission: 'users.roles.update',
    },
  ],
  locales: { en: enLocales, ar: arLocales },
  navGroups: [
    { id: 'users', label: 'roles_and_permissions', order: 20, icon: <Shield size={18} className="shrink-0" /> },
  ],
}

export default usersModule
