import enLocales from './presentation/locales/en.json';
import arLocales from './presentation/locales/ar.json';
import { Navigate } from 'react-router-dom';
import { Map, List, FileCheck, BadgeCheck, Tags, Layers, Flag, SlidersHorizontal, Coins, Handshake, Package } from 'lucide-react';
import type { Module } from '../../core/moduleRegistry';
import { registerPersonDetailRoute } from '../../core/registry/person/personRegistry';
import { registerTransactionableRoute } from '../../core/registry/transactionable/transactionableRegistry';
import { registerNotificationHandler } from '../../core/registry/notifications/notificationRegistry';
import type { Notification } from '../../core/domain/entities/notification/notification';
import { PlotAreasPage } from './presentation/pages/plot-areas/PlotAreasPage';
import { PlotClassificationsPage } from './presentation/pages/plot-classifications/PlotClassificationsPage';
import { PlotsPage } from './presentation/pages/plots/PlotsPage';
import { CreatePlotPage } from './presentation/pages/plots/CreatePlotPage';
import { EditPlotPage } from './presentation/pages/plots/EditPlotPage';
import { InvestorsPage } from './presentation/pages/investors/InvestorsPage';
import { CreateInvestorPage } from './presentation/pages/investors/CreateInvestorPage';
import { CreateFuturePossibleInvestorPage } from './presentation/pages/investors/CreateFuturepossibleInvestorPage';
import { EditInvestorPage } from './presentation/pages/investors/EditInvestorPage';
import { ShowDossierPage } from './presentation/pages/plots/ShowDossierPage';
import { DossiersPage } from './presentation/pages/dossiers/DossiersPage';
import { FacilitiesPage } from './presentation/pages/facilities/FacilitiesPage';
import { ShowContractPage } from './presentation/pages/contracts/ShowContractPage';
import { ContractsPage } from './presentation/pages/contracts/ContractsPage';
import { TransactionsPage } from './presentation/pages/transactions/TransactionsPage';
import { CreateSubscriptionPage } from './presentation/pages/transactions/CreateSubscriptionPage';
import { PartnershipTypesPage } from './presentation/pages/partnership-types/PartnershipTypesPage';
import { IndustrialDecisionTypesPage } from './presentation/pages/industrial-decision-types/IndustrialDecisionTypesPage';
import { IndustrialLicenseSourcesPage } from './presentation/pages/industrial-license-sources/IndustrialLicenseSourcesPage';
import { IndustryCategoriesPage } from './presentation/pages/industry-categories/IndustryCategoriesPage';
import { IndustryTypesPage } from './presentation/pages/industry-types/IndustryTypesPage';
import { ConsumptionMaterialsPage } from './presentation/pages/consumption-materials/ConsumptionMaterialsPage';
import { LicensingStatusesPage } from './presentation/pages/licensing-statuses/LicensingStatusesPage';
import { ByDurationLicensesPage } from './presentation/pages/by-duration-licenses/ByDurationLicensesPage';
import { ByIndustryLicensesPage } from './presentation/pages/by-industry-licenses/ByIndustryLicensesPage';
import { RentContractIndustriesPage } from './presentation/pages/rent-contract-industries/RentContractIndustriesPage';
import { RentContractPage } from './presentation/pages/rent-contracts/RentContractPage';
import { ServiceStatusConditionsPage } from './presentation/pages/service-status-conditions/ServiceStatusConditionsPage';
import { MapPin, Users, Clock, Building2, FileText, Factory, FileSignature } from 'lucide-react';
import { ShowFacilityPage } from './presentation/pages/plots/ShowFacilityPage';
import { FacilityIndustrialLicensesPage } from './presentation/pages/facility-industrial-licenses/FacilityIndustrialLicensesPage';
import { BuildingLicensesPage } from './presentation/pages/building-licenses/BuildingLicensesPage';
import { SubscriptionRequestsPage } from './presentation/pages/subscription-requests/SubscriptionRequestsPage';
import { ShowSubscriptionRequestPage } from './presentation/pages/subscription-requests/ShowSubscriptionRequestPage';

registerPersonDetailRoute({
  type: 'investor',
  routePattern: '/investments/investors/:id/edit',
  resolve: (id) => `/investments/investors/${id}/edit`,
  permission: 'investments.investors.update',
});

registerTransactionableRoute({
  type: 'App\\Modules\\Investments\\Domain\\Entities\\PlotDossier',
  resolve: (entity) => `/investments/plots/${entity.plot_id}/dossiers/${entity.id}`,
  permission: 'investments.plot-dossier.view',
});

interface SubscriptionRequestNotificationPayload {
  subscription_request?: {
    id?: number | string;
    plot_id?: number | string;
    status?: string;
  };
  plot?: {
    id?: number;
    code?: string;
  };
  dossier?: {
    id?: number;
    dossier_number?: string | null;
  };
}

const subscriptionRequestNotificationTypes: Array<{
  type: string;
  key: string;
  fallbackTitle: string;
  fallbackDescription: string;
}> = [
  {
    type: 'subscription_fee_paid.subscription_request',
    key: 'subscription_fee_paid_subscription_request',
    fallbackTitle: 'Subscription request fee paid',
    fallbackDescription: 'The subscription fee for the request has been paid',
  },
  {
    type: 'pending_subscription_department_manager.subscription_request',
    key: 'pending_subscription_department_manager_subscription_request',
    fallbackTitle: 'Subscription request pending department manager',
    fallbackDescription: 'A subscription request is pending your review',
  },
  {
    type: 'pending_general_manager.subscription_request',
    key: 'pending_general_manager_subscription_request',
    fallbackTitle: 'Subscription request pending general manager',
    fallbackDescription: 'A subscription request is pending your review',
  },
  {
    type: 'subscription_approved.subscription_request',
    key: 'subscription_approved_subscription_request',
    fallbackTitle: 'Subscription request approved',
    fallbackDescription: 'The subscription request has been approved',
  },
  {
    type: 'subscription_canceled_by_department_manager.subscription_request',
    key: 'subscription_canceled_by_department_manager_subscription_request',
    fallbackTitle: 'Subscription request canceled by department manager',
    fallbackDescription: 'The subscription request was canceled by the department manager',
  },
  {
    type: 'subscription_canceled_by_general_manager.subscription_request',
    key: 'subscription_canceled_by_general_manager_subscription_request',
    fallbackTitle: 'Subscription request canceled by general manager',
    fallbackDescription: 'The subscription request was canceled by the general manager',
  },
  {
    type: 'subscription_payment_canceled.subscription_request',
    key: 'subscription_payment_canceled_subscription_request',
    fallbackTitle: 'Subscription request payment canceled',
    fallbackDescription: 'The payment for the subscription request was canceled',
  },
  {
    type: 'subscription_completed.subscription_request',
    key: 'subscription_completed_subscription_request',
    fallbackTitle: 'Subscription request completed',
    fallbackDescription: 'The subscription request has been completed',
  },
];

const registerSubscriptionRequestNotification = (
  type: string,
  key: string,
  fallbackTitle: string,
  fallbackDescription: string
): void => {
  registerNotificationHandler(type, {
    title: ({ t }) =>
      t(`notifications.${key}_title`, 'investments') || fallbackTitle,
    description: ({ notification, t, data }) => {
      const payload = (data ?? notification.data?.payload) as SubscriptionRequestNotificationPayload | null;
      const subscription_request = payload?.subscription_request;
      const base =
        t(`notifications.${key}_description`, 'investments') || fallbackDescription;
      const extras = [
        subscription_request?.id ? `Request #${String(subscription_request.id)}` : '',
        payload?.plot?.code ?? '',
        payload?.dossier?.dossier_number ?? '',
      ]
        .filter(Boolean)
        .join(' - ');
      return extras ? `${base} (${extras})` : base;
    },
    action: ({ navigate, data }): void => {
      const payload = data as SubscriptionRequestNotificationPayload | null;
      const id = payload?.subscription_request?.id;
      navigate(id != null ? `/investments/subscription-requests/${id}` : '/investments/subscription-requests');
    },
    data: (notification: Notification): SubscriptionRequestNotificationPayload | null =>
      (notification.data?.payload as SubscriptionRequestNotificationPayload | null) ?? null,
  });
};

subscriptionRequestNotificationTypes.forEach(({ type, key, fallbackTitle, fallbackDescription }) =>
  registerSubscriptionRequestNotification(type, key, fallbackTitle, fallbackDescription)
);

const investmentsModule: Module = {
  name: 'investments',
  routes: [
    {
      path: '/investments/plots',
      element: <PlotsPage />,
      layout: 'dashboard',
      label: 'plots.title',
      nav: true,
      order: 5,
      requiredPermission: 'investments.plots.list',
      moduleName: 'investments',
      icon: <MapPin size={18} />,
      group: 'investments',
    },
    {
      path: '/investments/plots/create',
      element: <CreatePlotPage />,
      layout: 'dashboard',
      label: 'plots.add',
      nav: false,
      requiredPermission: 'investments.plots.create',
      moduleName: 'investments',
      group: 'investments',
    },
    {
      path: '/investments/dossiers',
      element: <DossiersPage />,
      layout: 'dashboard',
      label: 'dossiers.title',
      nav: true,
      order: 7,
      requiredPermission: 'investments.plot-dossier.list',
      moduleName: 'investments',
      icon: <FileText size={18} />,
      group: 'investments',
    },
    {
      path: '/investments/plots/:plotId/dossiers/:dossierId',
      element: <ShowDossierPage />,
      layout: 'dashboard',
      label: 'dossier.view_details',
      nav: false,
      requiredPermission: 'investments.plot-dossier.view',
      moduleName: 'investments',
      group: 'investments',
    },
    {
      path: '/investments/plots/:plotId/dossiers/:dossierId/contract/:id',
      element: <ShowContractPage />,
      layout: 'dashboard',
      label: 'contract.title',
      nav: false,
      requiredPermission: 'investments.contracts.view',
      moduleName: 'investments',
      group: 'investments',
    },
    {
      path: '/investments/facilities',
      element: <FacilitiesPage />,
      layout: 'dashboard',
      label: 'facilities.title',
      nav: true,
      order: 8,
      requiredPermission: 'investments.facilities.list',
      moduleName: 'investments',
      icon: <Factory size={18} />,
      group: 'investments',
    },
    {
      path: '/investments/facility-industrial-licenses',
      element: <FacilityIndustrialLicensesPage />,
      layout: 'dashboard',
      label: 'facility_industrial_licenses.title',
      nav: true,
      order: 9,
      requiredPermission: 'investments.facility-industrial-licenses.list',
      moduleName: 'investments',
      icon: <BadgeCheck size={18} />,
      group: 'investments',
    },
    {
      path: '/investments/contracts',
      element: <ContractsPage />,
      layout: 'dashboard',
      label: 'contract.title',
      nav: true,
      order: 9,
      requiredPermission: 'investments.contracts.list',
      moduleName: 'investments',
      icon: <FileSignature size={18} />,
      group: 'investments',
    },
    {
      path: '/investments/building-licenses',
      element: <BuildingLicensesPage />,
      layout: 'dashboard',
      label: 'building_license.title',
      nav: true,
      order: 10,
      requiredPermission: 'investments.building-licenses.list',
      moduleName: 'investments',
      icon: <Building2 size={18} />,
      group: 'investments',
    },
    {
      path: '/investments/rent-contracts',
      element: <RentContractPage />,
      layout: 'dashboard',
      label: 'rent_contract.title',
      nav: true,
      order: 11,
      requiredPermission: 'investments.rent-contracts.list',
      moduleName: 'investments',
      icon: <FileSignature size={18} />,
      group: 'investments',
    },
    {
      path: '/investments/transactions',
      element: <TransactionsPage />,
      layout: 'dashboard',
      label: 'transactions.title',
      nav: true,
      order: 10,
      // requiredPermission: 'investments.transactions.list',
      moduleName: 'investments',
      icon: <Coins size={18} />,
      group: 'investments_transactions',
    },
    {
      path: '/investments/transactions/create',
      element: <CreateSubscriptionPage />,
      layout: 'dashboard',
      label: 'transactions.create_title',
      nav: false,
      requiredPermission: 'investments.plot-reqeusts.subscription_request',
      moduleName: 'investments',
      group: 'investments_transactions',
    },
    {
      path: '/investments/subscription-requests',
      element: <SubscriptionRequestsPage />,
      layout: 'dashboard',
      label: 'subscription_requests.title',
      nav: true,
      order: 26,
      requiredPermission: 'investments.plot-reqeusts.subscription_requests.list',
      moduleName: 'investments',
      icon: <FileText size={18} />,
      group: 'investments_transactions',
    },
    {
      path: '/investments/subscription-requests/:id',
      element: <ShowSubscriptionRequestPage />,
      layout: 'dashboard',
      label: 'subscription_requests.view',
      nav: false,
      requiredPermission: 'investments.plot-reqeusts.subscription_requests.view',
      moduleName: 'investments',
      group: 'investments_transactions',
    },
    {
      path: '/investments/plots/:plotId/dossiers/:dossierId/facilities/:facilityId',
      element: <ShowFacilityPage />,
      layout: 'dashboard',
      label: 'facilities.view',
      nav: false,
      requiredPermission: 'investments.facilities.view',
      moduleName: 'investments',
      group: 'investments',
    },
    {
      path: '/investments/plots/:id/edit',
      element: <EditPlotPage />,
      layout: 'dashboard',
      label: 'common.edit',
      nav: false,
      requiredPermission: 'investments.plots.update',
      moduleName: 'investments',
      group: 'investments',
    },
    {
      path: '/investments/plot-areas',
      element: <PlotAreasPage />,
      layout: 'dashboard',
      label: 'plot_areas.title',
      nav: true,
      order: 1,
      moduleName: 'investments',
      requiredPermission: 'investments.plot-areas.list',
      icon: <Map size={18} />,
      group: 'investments',
      parentNav: '/investments/settings',
    },
    {
      path: '/investments/plot-classifications',
      element: <PlotClassificationsPage />,
      layout: 'dashboard',
      label: 'plot_classifications.title',
      nav: true,
      order: 2,
      moduleName: 'investments',
      requiredPermission: 'investments.plot-classifications.list',
      icon: <List size={18} />,
      group: 'investments',
      parentNav: '/investments/settings',
    },
    {
      path: '/investments/service-status-conditions',
      element: <ServiceStatusConditionsPage />,
      layout: 'dashboard',
      label: 'service_status_conditions.title',
      nav: true,
      order: 3,
      moduleName: 'investments',
      requiredPermission: 'investments.service-status-conditions.list',
      icon: <FileCheck size={18} />,
      group: 'investments',
      parentNav: '/investments/settings',
    },
    {
      path: '/investments/partnership-types',
      element: <PartnershipTypesPage />,
      layout: 'dashboard',
      label: 'partnership_types.title',
      nav: true,
      order: 4,
      requiredPermission: 'investments.partnership-types.list',
      moduleName: 'investments',
      icon: <Handshake size={18} />,
      group: 'investments',
      parentNav: '/investments/settings',
    },
    {
      path: '/investments/investors',
      element: <InvestorsPage />,
      layout: 'dashboard',
      label: 'investors.title',
      nav: true,
      order: 25,
      requiredPermission: 'investments.investors.list',
      moduleName: 'investments',
      icon: <Users size={18} />,
      group: 'investments',
    },
    {
      path: '/investments/investors/create',
      element: <CreateInvestorPage />,
      layout: 'dashboard',
      label: 'investors.add',
      nav: false,
      requiredPermission: 'investments.investors.create',
      moduleName: 'investments',
      group: 'investments',
    },
    {
      path: '/investments/investors/create-future-possible',
      element: <CreateFuturePossibleInvestorPage />,
      layout: 'dashboard',
      label: 'investors.add_future_possible',
      nav: false,
      requiredPermission: 'investments.investors.create',
      moduleName: 'investments',
      group: 'investments',
    },
    {
      path: '/investments/investors/:id/edit',
      element: <EditInvestorPage />,
      layout: 'dashboard',
      label: 'common.edit',
      nav: false,
      requiredPermission: 'investments.investors.update',
      moduleName: 'investments',
      group: 'investments',
    },
    {
      path: '/investments/industry-categories',
      element: <IndustryCategoriesPage />,
      layout: 'dashboard',
      label: 'industry_categories.title',
      nav: true,
      order: 5,
      moduleName: 'investments',
      requiredPermission: 'investments.industry-categories.list',
      icon: <Tags size={18} />,
      group: 'investments',
      parentNav: '/investments/settings',
    },
    {
      path: '/investments/industry-types',
      element: <IndustryTypesPage />,
      layout: 'dashboard',
      label: 'industry_types.title',
      nav: true,
      order: 6,
      moduleName: 'investments',
      requiredPermission: 'investments.industry-types.list',
      icon: <Layers size={18} />,
      group: 'investments',
      parentNav: '/investments/settings',
    },
    {
      path: '/investments/consumable-materials',
      element: <ConsumptionMaterialsPage />,
      layout: 'dashboard',
      label: 'consumption_materials.title',
      nav: true,
      order: 7,
      moduleName: 'investments',
      requiredPermission: 'investments.consumable-materials.list',
      icon: <Package size={18} />,
      group: 'investments',
      parentNav: '/investments/settings',
    },
    {
      path: '/investments/licensing-statuses',
      element: <LicensingStatusesPage />,
      layout: 'dashboard',
      label: 'licensing_statuses.title',
      nav: true,
      order: 8,
      moduleName: 'investments',
      requiredPermission: 'investments.license-statuses.list',
      icon: <Flag size={18} />,
      group: 'investments',
      parentNav: '/investments/settings',
    },
    {
      path: '/investments/industrial-decision-types',
      element: <IndustrialDecisionTypesPage />,
      layout: 'dashboard',
      label: 'industrial_decision_types.title',
      nav: true,
      order: 9,
      moduleName: 'investments',
      requiredPermission: 'investments.industrial-decision-types.list',
      icon: <FileCheck size={18} />,
      group: 'investments',
      parentNav: '/investments/settings',
    },
    {
      path: '/investments/industrial-license-sources',
      element: <IndustrialLicenseSourcesPage />,
      layout: 'dashboard',
      label: 'industrial_license_sources.title',
      nav: true,
      order: 10,
      moduleName: 'investments',
      requiredPermission: 'investments.industrial-license-sources.list',
      icon: <BadgeCheck size={18} />,
      group: 'investments',
      parentNav: '/investments/settings',
    },
    {
      path: '/investments/by-duration-licenses',
      element: <ByDurationLicensesPage />,
      layout: 'dashboard',
      label: 'by_duration_licenses.title',
      nav: true,
      order: 11,
      moduleName: 'investments',
      requiredPermission: 'investments.by-duration-licenses.list',
      icon: <Clock size={18} />,
      group: 'investments',
      parentNav: '/investments/settings',
    },
    {
      path: '/investments/by-industry-licenses',
      element: <ByIndustryLicensesPage />,
      layout: 'dashboard',
      label: 'by_industry_licenses.title',
      nav: true,
      order: 12,
      moduleName: 'investments',
      requiredPermission: 'investments.by-industry-licenses.list',
      icon: <Building2 size={18} />,
      group: 'investments',
      parentNav: '/investments/settings',
    },
    {
      path: '/investments/rent-contract-industries',
      element: <RentContractIndustriesPage />,
      layout: 'dashboard',
      label: 'rent_contract_industries.title',
      nav: true,
      order: 13,
      moduleName: 'investments',
      requiredPermission: 'investments.rent-contract-industries.list',
      icon: <FileSignature size={18} />,
      group: 'investments',
      parentNav: '/investments/settings',
    },
    {
      path: '/investments/settings',
      element: <Navigate to="/investments/partnership-types" replace />,
      layout: 'dashboard',
      label: 'settings.title',
      nav: true,
      order: 31,
      moduleName: 'investments',
      icon: <SlidersHorizontal size={18} />,
      group: 'investments',
      requiredPermission: [
        'investments.plot-areas.list',
        'investments.plot-classifications.list',
        'investments.service-status-conditions.list',
        'investments.partnership-types.list',
        'investments.industry-categories.list',
        'investments.industry-types.list',
        'investments.consumable-materials.list',
        'investments.license-statuses.list',
        'investments.industrial-decision-types.list',
        'investments.industrial-license-sources.list',
        'investments.by-duration-licenses.list',
        'investments.by-industry-licenses.list',
        'investments.rent-contract-industries.list',
      ],
    },
  ],
  locales: { en: enLocales, ar: arLocales },
  navGroups: [
    { id: 'investments', label: 'title', order: 20, icon: <Map size={10} className="shrink-0" /> },
    { id: 'investments_transactions', label: 'transactions.title', order: 22, icon: <Coins size={10} className="shrink-0" /> },
  ],
};

export default investmentsModule;