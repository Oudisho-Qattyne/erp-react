import { Wallet, Receipt, ArrowLeftRight } from 'lucide-react';
import type { Module } from '../../core/moduleRegistry';
import { registerNotificationHandler } from '../../core/registry/notifications/notificationRegistry';
import type { Notification } from '../../core/domain/entities/notification/notification';
import { FeesPage } from './presentation/pages/FeesPage';
import { TransactionsPage } from './presentation/pages/TransactionsPage';
import enLocales from './presentation/locales/en.json';
import arLocales from './presentation/locales/ar.json';

interface SubscriptionRequestPayload {
  transaction?: {
    id?: string;
    transaction_value?: number | string;
    reason?: string;
  };
  dossier?: {
    id?: number;
    dossier_number?: string | null;
    plot?: {
      id?: number;
      code?: string;
    };
  };
}

registerNotificationHandler('subscription_request.transaction_created', {
  title: ({ t }) =>
    t('notifications.subscription_request_transaction_created_title', 'finance') ||
    'Subscription request transaction created',
  description: ({ notification, t, data }) => {
    const payload = (data ?? notification.data?.payload) as SubscriptionRequestPayload | null;
    const transaction = payload?.transaction;
    const base =
      t('notifications.subscription_request_transaction_created_description', 'finance') ||
      'A transaction was created for the subscription request';
    const extras = [
      transaction?.id ? `#${String(transaction.id).slice(0, 8)}` : '',
      transaction?.reason ?? '',
    ]
      .filter(Boolean)
      .join(' - ');
    return extras ? `${base} (${extras})` : base;
  },
  action: ({ navigate, data }): void => {
    const payload = data as SubscriptionRequestPayload | null;
    const reason = payload?.transaction?.reason;
    if (reason) {
      navigate('/finance/transactions', { state: { filter: { search: reason } } });
      return;
    }
    navigate('/investments/plots');
  },
  data: (notification: Notification): SubscriptionRequestPayload | null =>
    (notification.data?.payload as SubscriptionRequestPayload | null) ?? null,
});

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
      requiredPermission: 'financial.payment-fees.list',
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
      requiredPermission: 'financial.transactions.list',
    },
  ],
  locales: { en: enLocales, ar: arLocales },
  navGroups: [
    { id: 'finance', label: 'title', order: 25, icon: <Wallet size={16} className="shrink-0" /> },
  ],
};

export default financeModule;
