import enLocales from './presentation/locales/en.json';
import arLocales from './presentation/locales/ar.json';
import { Map, List } from 'lucide-react';
import type { Module } from '../../core/moduleRegistry';
import { PlotAreasPage } from './presentation/pages/plot-areas/PlotAreasPage';
import { PlotClassificationsPage } from './presentation/pages/plot-classifications/PlotClassificationsPage';
import { PlotsPage } from './presentation/pages/plots/PlotsPage';
import { CreatePlotPage } from './presentation/pages/plots/CreatePlotPage';
import { EditPlotPage } from './presentation/pages/plots/EditPlotPage';
import { InvestorsPage } from './presentation/pages/investors/InvestorsPage';
import { CreateInvestorPage } from './presentation/pages/investors/CreateInvestorPage';
import { CreateFuturePossibleInvestorPage } from './presentation/pages/investors/CreateFuturepossibleInvestorPage';
import { EditInvestorPage } from './presentation/pages/investors/EditInvestorPage';
import { MapPin, Users } from 'lucide-react';

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
      order: 10,
      moduleName: 'investments',
      requiredPermission: 'investments.plot-areas.list',
      icon: <Map size={18} />,
      group: 'investments',
    },
    {
      path: '/investments/plot-classifications',
      element: <PlotClassificationsPage />,
      layout: 'dashboard',
      label: 'plot_classifications.title',
      nav: true,
      order: 20,
      moduleName: 'investments',
      requiredPermission: 'investments.plot-classifications.list',
      icon: <List size={18} />,
      group: 'investments',
    },
    {
      path: '/investments/investors',
      element: <InvestorsPage />,
      layout: 'dashboard',
      label: 'investors.title',
      nav: true,
      order: 30,
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
    }
  ],
  locales: { en: enLocales, ar: arLocales },
  navGroups: [
    { id: 'investments', label: 'title', order: 20, icon: <Map size={10} className="shrink-0" /> },
  ],
};

export default investmentsModule;