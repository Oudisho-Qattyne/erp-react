import enLocales from './presentation/locales/en.json'
import arLocales from './presentation/locales/ar.json'
import { Shield, Users, Link2 } from 'lucide-react'
import type { Module } from '../../core/moduleRegistry'
import { RolesListPage } from './presentation/pages/RolesListPage'
import { EditRolePage } from './presentation/pages/EditRolePage'
import { ShowRolePage } from './presentation/pages/ShowRolePage'
import { AllUsers } from './presentation/pages/user/AllUsers'
import { LinkUserToEmployee } from './presentation/pages/user/LinkUserToEmployee'
import { registerUserApi } from '../../core/registry/user/userRegistry'
import { createFetchApiClient } from '../../core/infrastructure/api/fetchApiClient'
import { createUserRepository } from './infrastructure/repositories/user/repository'
import { createManageUserUseCase } from './application/usecases/user/manageUserUsecase'

const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:3000/api'

const client = createFetchApiClient(API_BASE_URL, () => document.documentElement.lang || 'en')
const repository = createUserRepository(client)
const useCase = createManageUserUseCase(repository)

registerUserApi({ getCurrentUser: useCase.getCurrentUser })

const usersModule: Module = {
  name: 'users',
  routes: [
    {
      path: '/users',
      element: <AllUsers />,
      layout: 'dashboard',
      label: 'users.title',
      nav: true,
      order: 10,
      moduleName: 'users',
      icon: <Users size={18} />,
      group: 'users',
      requiredPermission: 'users.users.view',
    },
    {
      path: '/users/link-to-employee',
      element: <LinkUserToEmployee />,
      layout: 'dashboard',
      label: 'link_user.title',
      nav: true,
      order: 20,
      moduleName: 'users',
      icon: <Link2 size={18} />,
      group: 'users',
      requiredPermission: 'users.users.link-to-employee',
    },
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
      requiredPermission: 'users.roles.view',
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
