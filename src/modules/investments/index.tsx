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
      permission: 'investments.plots.list',
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
      permission: 'investments.plots.create',
      moduleName: 'investments',
      group: 'investments',
    },
    {
      path: '/investments/plots/:id/edit',
      element: <EditPlotPage />,
      layout: 'dashboard',
      label: 'common.edit',
      nav: false,
      permission: 'investments.plots.update',
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
      permission: 'investments.investors.list',
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
      permission: 'investments.investors.create',
      moduleName: 'investments',
      group: 'investments',
    },
    {
      path: '/investments/investors/:id/edit',
      element: <EditInvestorPage />,
      layout: 'dashboard',
      label: 'common.edit',
      nav: false,
      permission: 'investments.investors.update',
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
