import { Wallet, Receipt, ArrowLeftRight, Coins, Settings, Scale } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import type { Module } from '../../core/moduleRegistry';
import { registerNotificationHandler } from '../../core/registry/notifications/notificationRegistry';
import { registerTransactionableRoute } from '../../core/registry/transactionable/transactionableRegistry';
import type { Notification } from '../../core/domain/entities/notification/notification';
import { FeesPage } from './presentation/pages/FeesPage';
import { TransactionsPage } from './presentation/pages/TransactionsPage';
import { CurrenciesPage } from './presentation/pages/CurrenciesPage';
import { ExchangeRatesPage } from './presentation/pages/ExchangeRatesPage';
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

interface SubscriptionTransactionPayload {
  subscription_request?: {
    id?: number | string;
    created_at?:string;
    created_by?:number;
    deleted_at?:string;
  };
  transaction?: {
    id?: string;
    transaction_type?: string;
    transaction_status?: string;
    transaction_value?: number | string;
    reason?: string;
  };
  payment_fee?: {
    id?: number | string;
    name?: string;
    code?: string;
    fee_value?: number | string;
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
    const id = payload?.transaction?.id;
    if (id) {
      navigate('/finance/transactions', { state: { filter: { id: id } } });
      return;
    }
    navigate('/investments/plots');
  },
  data: (notification: Notification): SubscriptionRequestPayload | null =>
    (notification.data?.payload as SubscriptionRequestPayload | null) ?? null,
});

registerNotificationHandler('transaction.created', {
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
    const id = payload?.transaction?.id;
    if (id) {
      navigate('/finance/transactions', { state: { filter: { id: id } } });
      return;
    }
    navigate('/investments/plots');
  },
  data: (notification: Notification): SubscriptionRequestPayload | null =>
    (notification.data?.payload as SubscriptionRequestPayload | null) ?? null,
});

registerNotificationHandler('transaction_approved.subscription_request', {
  title: ({ t }) =>
    t('notifications.subscription_request_transaction_approved_title', 'finance') ||
    'Subscription request transaction approved',
  description: ({ notification, t, data }) => {
    const payload = (data ?? notification.data?.payload) as SubscriptionTransactionPayload | null;
    const transaction = payload?.transaction;
    const subscription_request = payload?.subscription_request;
    const paymentFee = payload?.payment_fee;
    const base =
      t('notifications.subscription_request_transaction_approved_description', 'finance') ||
      'A transaction for the subscription request was approved';
    const extras = [
      transaction?.id ? `#${String(transaction.id).slice(0, 8)}` : '',
      transaction?.transaction_value != null ? `$${String(transaction.transaction_value)}` : '',
      subscription_request?.id ?? (subscription_request?.id ? `Subscription Request #${subscription_request.id}` : ''),
      paymentFee?.name ?? '',
    ]
      .filter(Boolean)
      .join(' - ');
    return extras ? `${base} (${extras})` : base;
  },
  action: ({ navigate, data }): void => {
    const payload = data as SubscriptionTransactionPayload | null;
    const subscription_request = payload?.subscription_request;
    if (subscription_request?.id) {
      navigate(`/investments/subscription-requests/${subscription_request?.id}`);
      return;
    }
    navigate('/finance/transactions');
  },
  data: (notification: Notification): SubscriptionTransactionPayload | null =>
    (notification.data?.payload as SubscriptionTransactionPayload | null) ?? null,
});
registerNotificationHandler('transaction_canceled.subscription_request', {
  title: ({ t }) =>
    t('notifications.subscription_request_transaction_canceled_title', 'finance') ||
    'Subscription request transaction canceled',
  description: ({ notification, t, data }) => {
    const payload = (data ?? notification.data?.payload) as SubscriptionTransactionPayload | null;
    const transaction = payload?.transaction;
    const subscription_request = payload?.subscription_request;
    const paymentFee = payload?.payment_fee;
    const base =
      t('notifications.subscription_request_transaction_canceled_description', 'finance') ||
      'A transaction for the subscription request was canceled';
    const extras = [
      transaction?.id ? `#${String(transaction.id).slice(0, 8)}` : '',
      transaction?.transaction_value != null ? `$${String(transaction.transaction_value)}` : '',
      subscription_request?.id ?? (subscription_request?.id ? `Subscription Request #${subscription_request.id}` : ''),
      paymentFee?.name ?? '',
    ]
      .filter(Boolean)
      .join(' - ');
    return extras ? `${base} (${extras})` : base;
  },
  action: ({ navigate, data }): void => {
    const payload = data as SubscriptionTransactionPayload | null;
    const subscription_request = payload?.subscription_request;
    if (subscription_request?.id ) {
      navigate(`/investments/subscription-requests/${subscription_request?.id}`);
      return;
    }
    navigate('/finance/transactions');
  },
  data: (notification: Notification): SubscriptionTransactionPayload | null =>
    (notification.data?.payload as SubscriptionTransactionPayload | null) ?? null,
});

registerTransactionableRoute({
  type: 'App\\Modules\\FinancialManagement\\Domain\\Entities\\PaymentFee',
  resolve: () => `/finance/fees`,
  permission: 'financial.payment-fees.list',
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
      parentNav: '/finance/settings',
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
    {
      path: '/finance/currencies',
      element: <CurrenciesPage />,
      layout: 'dashboard',
      label: 'currencies.title',
      nav: true,
      order: 28,
      moduleName: 'finance',
      icon: <Coins size={18} />,
      group: 'finance',
      parentNav: '/finance/settings',
      requiredPermission: 'financial.currencies.list',
    },
    {
      path: '/finance/settings',
      element: <Navigate to="/finance/fees" replace />,
      layout: 'dashboard',
      label: 'settings.title',
      nav: true,
      order: 28,
      moduleName: 'finance',
      icon: <Settings size={18} />,
      group: 'finance',
      requiredPermission: ['financial.payment-fees.list', 'financial.currencies.list', 'financial.exchange-rates.list'],
    },
    {
      path: '/finance/exchange-rates',
      element: <ExchangeRatesPage />,
      layout: 'dashboard',
      label: 'exchange_rates.title',
      nav: true,
      order: 29,
      moduleName: 'finance',
      icon: <Scale size={18} />,
      group: 'finance',
      parentNav: '/finance/settings',
      requiredPermission: 'financial.exchange-rates.list',
    },
  ],
  locales: { en: enLocales, ar: arLocales },
  navGroups: [
    { id: 'finance', label: 'title', order: 25, icon: <Wallet size={16} className="shrink-0" /> },
  ],
};

export default financeModule;
