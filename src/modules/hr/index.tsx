// import UsersPage from './presentation/pages/UsersPage'
import enLocales from './presentation/locales/en.json'
import arLocales from './presentation/locales/ar.json'
import { Users } from 'lucide-react'   // or any icon component
import type { Module } from '../../core/moduleRegistry'
// import CreateUserPage from './presentation/pages/CreateUserPage'
import { ReportsPage } from './presentation/pages/ReportsPage'
import { EmployeesPage } from './presentation/pages/EmployeesPage'
import { ShowEmployeePage } from './presentation/pages/ShowEmployeePage'
import { EditEmployeePage } from './presentation/pages/EditEmployeePage'

const usersModule: Module = {
  name: 'hr',
  routes: [
    {
      path: '/hr',
      element: <ReportsPage />,
      layout: 'dashboard',
      label: 'reports.title',
      nav: true,
      order: 10,
      moduleName: 'hr',
      icon: <Users className="w-5 h-5" />,   // 👈 React element
      group: 'hr',
      permission: 'hr:read',
    },
    {
      path: '/hr/employees',
      element: <EmployeesPage />,
      layout: 'dashboard',
      label: 'employees.title',   // translate in locale
      nav: true,
      order: 30,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'hr',
    },
    {
      path: '/hr/employees/:id',
      element: <ShowEmployeePage />,
      layout: 'dashboard',
      label: 'employee_details.title',
      nav: false,
      moduleName: 'hr',
      requiresAuth: true,
      requiredRole: 'admin',
    },
    {
      path: '/hr/employees/:id/edit',
      element: <EditEmployeePage />,
      layout: 'dashboard',
      label: 'edit_employee.title',
      nav: false,
      moduleName: 'hr',
      requiresAuth: true,
      requiredRole: 'admin',
    }
  ],
  locales: { en: enLocales, ar: arLocales },
  navGroups: [
    { id: 'hr', label: 'admin', order: 10, icon: <Users size={10} className="shrink-0" /> },
  ],
}

export default usersModule