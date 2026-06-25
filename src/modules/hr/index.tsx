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
import { CountriesPage } from './presentation/pages/lookups/CountriesPage'
import { CitiesPage } from './presentation/pages/lookups/CitiesPage'
import { RegionsPage } from './presentation/pages/lookups/RegionsPage'
import { UniversitiesPage } from './presentation/pages/lookups/UniversitiesPage'
import { FacultiesPage } from './presentation/pages/lookups/FacultiesPage'
import { SpecializationsPage } from './presentation/pages/lookups/SpecializationsPage'
import { JobStatusesPage } from './presentation/pages/lookups/JobStatusesPage'
import { EmployeeStatusesPage } from './presentation/pages/lookups/EmployeeStatusesPage'
import { Rules } from './presentation/pages/Rules'
import LeaveForm from './presentation/pages/leaves/LeaveForm'
import LeavesTypesPage from './presentation/pages/leaves/LeavesTypesPage'
import { ShowLeaveTypePage } from './presentation/pages/leaves/ShowLeaveTypePage'
import { EditLeaveTypePage } from './presentation/pages/leaves/EditLeaveTypePage'
import { UserEligibleLeaveTypes } from './presentation/pages/leaves/UserEligibleLeaveTypes'
import { UserLeaveBalances } from './presentation/pages/leaveBalances/UserLeaveBalances'
import { EmployeeLeaveBalances } from './presentation/pages/leaveBalances/EmployeeLeaveBalances'
import { CreateLeaveRequest } from './presentation/pages/leaveRequest/CreateLeaveRequest'
import { UserLeaveRequests } from './presentation/pages/leaveRequest/UseLeaveRequests'
import { EmployeeLeaveRequests } from './presentation/pages/leaveRequest/EmployeeLeaveRequests'
import { AdjustEmployeesLeaveBalance } from './presentation/pages/leaveBalances/AdjustEmployeesLeaveBalance'

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
      icon: <Users className="w-5 h-5" />,
      group: 'hr',
    },
    {
      path: '/hr/leaves',
      element: <LeavesTypesPage  />,
      layout: 'dashboard',
      label: 'leave_types.title',
      nav: true,
      order: 10,
      icon: <Users className="w-5 h-5" />,
      moduleName: 'hr',
      group: 'hr',
      requiresAuth: true,
      // requiredRole: 'admin',
    },
    {
      path: '/hr/leaves/:id',
      element: <ShowLeaveTypePage />,
      layout: 'dashboard',
      label: 'show_leave.title',
      nav: false,
      moduleName: 'hr',
      requiresAuth: true,
    },
    {
      path: '/hr/user-eligible-leave-types',
      element: <UserEligibleLeaveTypes />,
      layout: 'dashboard',
      label: 'leave.user_eligible_leave_types',
      nav: true,
      order: 20,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'hr',
      requiresAuth: true,
    },
    {
      path: '/hr/user-leave-balances',
      element: <UserLeaveBalances />,
      layout: 'dashboard',
      label: 'leave_balance.title',
      nav: true,
      order: 21,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'hr',
      requiresAuth: true,
    },
    {
      path: '/hr/employee-leave-balances',
      element: <EmployeeLeaveBalances />,
      layout: 'dashboard',
      label: 'employee_leave_balances.title',
      nav: true,
      order: 22,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'hr',
      requiresAuth: true,
    },
    {
      path: '/hr/my-leave-requests',
      element: <UserLeaveRequests />,
      layout: 'dashboard',
      label: 'leave_request.title',
      nav: true,
      order: 23,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'hr',
      requiresAuth: true,
    },
    {
      path: '/hr/employee-leave-requests',
      element: <EmployeeLeaveRequests />,
      layout: 'dashboard',
      label: 'employee_leave_requests.title',
      nav: true,
      order: 24,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'hr',
      requiresAuth: true,
    },
    {
      path: '/hr/leave-requests/create',
      element: <CreateLeaveRequest />,
      layout: 'dashboard',
      label: 'leave_request.create_title',
      nav: false,
      moduleName: 'hr',
      requiresAuth: true,
    },
    {
      path: '/hr/leave-requests/:id/edit',
      element: <CreateLeaveRequest />,
      layout: 'dashboard',
      label: 'leave_request.edit_title',
      nav: false,
      moduleName: 'hr',
      requiresAuth: true,
    },
    {
      path: '/hr/adjust-leave-balance',
      element: <AdjustEmployeesLeaveBalance />,
      layout: 'dashboard',
      label: 'adjust_leave_balance.title',
      nav: true,
      order: 23,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'hr',
      requiresAuth: true,
    },
    // {
    //   path: '/hr/leaves/:id/edit',
    //   element: <EditLeaveTypePage />,
    //   layout: 'dashboard',
    //   label: 'edit_leave.title',
    //   nav: false,
    //   moduleName: 'hr',
    //   requiresAuth: true,
    // },
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
      // requiredRole: 'admin',
    },
    {
      path: '/hr/employees/:id/edit',
      element: <EditEmployeePage />,
      layout: 'dashboard',
      label: 'edit_employee.title',
      nav: false,
      moduleName: 'hr',
      requiresAuth: true,
      // requiredRole: 'admin',
    },

    {
      path: '/hr/lookups/countries',
      element: <CountriesPage />,
      layout: 'dashboard',
      label: 'lookups.tabs.countries',
      nav: true,
      order: 40,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'lookups',
    },
    {
      path: '/hr/lookups/cities',
      element: <CitiesPage />,
      layout: 'dashboard',
      label: 'lookups.tabs.cities',
      nav: true,
      order: 41,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'lookups',
    },
    {
      path: '/hr/lookups/regions',
      element: <RegionsPage />,
      layout: 'dashboard',
      label: 'lookups.tabs.regions',
      nav: true,
      order: 42,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'lookups',
    },
    {
      path: '/hr/lookups/universities',
      element: <UniversitiesPage />,
      layout: 'dashboard',
      label: 'lookups.tabs.universities',
      nav: true,
      order: 43,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'lookups',
    },
    {
      path: '/hr/lookups/faculties',
      element: <FacultiesPage />,
      layout: 'dashboard',
      label: 'lookups.tabs.faculties',
      nav: true,
      order: 44,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'lookups',
    },
    {
      path: '/hr/lookups/specializations',
      element: <SpecializationsPage />,
      layout: 'dashboard',
      label: 'lookups.tabs.specializations',
      nav: true,
      order: 45,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'lookups',
    },
    {
      path: '/hr/lookups/job-statuses',
      element: <JobStatusesPage />,
      layout: 'dashboard',
      label: 'lookups.tabs.job_statuses',
      nav: true,
      order: 46,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'lookups',
    },
    {
      path: '/hr/lookups/employee-statuses',
      element: <EmployeeStatusesPage />,
      layout: 'dashboard',
      label: 'lookups.tabs.employee_statuses',
      nav: true,
      order: 47,
      moduleName: 'hr',
      icon: <Users size={18} />,
      group: 'lookups',
    }
  ],
  locales: { en: enLocales, ar: arLocales },
  navGroups: [
    { id: 'hr', label: 'hr', order: 10, icon: <Users size={10} className="shrink-0" /> },
    { id: 'lookups', label: 'lookups.title', order: 10, icon: <Users size={10} className="shrink-0" /> },
  ],
}

export default usersModule