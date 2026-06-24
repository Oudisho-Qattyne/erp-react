import enLocales from './presentation/locales/en.json';
import arLocales from './presentation/locales/ar.json';
import { Map, List } from 'lucide-react';
import type { Module } from '../../core/moduleRegistry';
import { PlotAreasPage } from './presentation/pages/plot-areas/PlotAreasPage';
import { PlotClassificationsPage } from './presentation/pages/plot-classifications/PlotClassificationsPage';

const investmentsModule: Module = {
  name: 'investments',
  routes: [
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
    }
  ],
  locales: { en: enLocales, ar: arLocales },
  navGroups: [
    { id: 'investments', label: 'title', order: 20, icon: <Map size={10} className="shrink-0" /> },
  ],
};

export default investmentsModule;
