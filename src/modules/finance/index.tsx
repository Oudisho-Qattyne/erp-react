import { Wallet } from 'lucide-react';
import type { Module } from '../../core/moduleRegistry';
import { FinanceDashboardPage } from './presentation/pages/FinanceDashboardPage';
import enLocales from './presentation/locales/en.json';
import arLocales from './presentation/locales/ar.json';

const financeModule: Module = {
  name: 'finance',
  routes: [
    {
      path: '/finance',
      element: <FinanceDashboardPage />,
      layout: 'dashboard',
      label: 'dashboard.title',
      nav: true,
      order: 25,
      moduleName: 'finance',
      icon: <Wallet size={18} />,
      group: 'finance',
    },
  ],
  locales: { en: enLocales, ar: arLocales },
  navGroups: [
    { id: 'finance', label: 'title', order: 25, icon: <Wallet size={16} className="shrink-0" /> },
  ],
};

export default financeModule;
