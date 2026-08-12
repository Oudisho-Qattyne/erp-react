import { Users } from 'lucide-react';
import type { Module } from '../../core/moduleRegistry';
import { PersonsPage } from './presentation/pages/PersonsPage';
import enLocales from './presentation/locales/en.json';
import arLocales from './presentation/locales/ar.json';

const crmModule: Module = {
  name: 'crm',
  routes: [
    {
      path: '/crm/persons',
      element: <PersonsPage />,
      layout: 'dashboard',
      label: 'persons.title',
      nav: true,
      order: 1,
      requiredPermission: 'crm.people.list',
      moduleName: 'crm',
      icon: <Users size={18} />,
      group: 'crm',
    },
  ],
  locales: { en: enLocales, ar: arLocales },
  navGroups: [
    { id: 'crm', label: 'title', order: 30, icon: <Users size={16} className="shrink-0" /> },
  ],
};

export default crmModule;
