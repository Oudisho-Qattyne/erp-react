import { Wallet, Receipt, ArrowLeftRight } from 'lucide-react';
import type { Module } from '../../core/moduleRegistry';
import { FeesPage } from './presentation/pages/FeesPage';
import { TransactionsPage } from './presentation/pages/TransactionsPage';
import enLocales from './presentation/locales/en.json';
import arLocales from './presentation/locales/ar.json';

const financeModule: Module = {
  name: 'finance',
  routes: [
    {
      path: '/finance/fees',
      element: <FeesPage />,
      layout: 'dashboard',
      label: 'fees.title',
      nav: true,
      order: 26,
      moduleName: 'finance',
      icon: <Receipt size={18} />,
      group: 'finance',
      requiredPermission: 'financial.payment-fee.list',
    },
    {
      path: '/finance/transactions',
      element: <TransactionsPage />,
      layout: 'dashboard',
      label: 'transactions.title',
      nav: true,
      order: 27,
      moduleName: 'finance',
      icon: <ArrowLeftRight size={18} />,
      group: 'finance',
      // requiredPermission: 'financial.transaction.list',
    },
  ],
  locales: { en: enLocales, ar: arLocales },
  navGroups: [
    { id: 'finance', label: 'title', order: 25, icon: <Wallet size={16} className="shrink-0" /> },
  ],
};

export default financeModule;
