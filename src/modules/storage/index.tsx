import { type Module } from '../../core/moduleRegistry';
import enLocales from './presentation/locales/en.json';
import arLocales from './presentation/locales/ar.json';
import { registerStorageApi, type StorageApi } from '../../core/registry/storage/storageRegistry';
import { StorageExplorer } from './presentation/pages/StorageExplorer';
import { File, FolderIcon } from 'lucide-react';
import { FileExplorer } from './presentation/components/FileExplorer';
import { FilePicker } from './presentation/components/FilePicker';
import { FileExplorerDialog } from './presentation/components/FileExplorerDialog';

const createStorageApi = (): StorageApi => {
  return {
    FilePickerComponent: FilePicker,
    FileExplorerComponent: FileExplorer,
    FileExplorerDialogComponent: FileExplorerDialog,
  };
};


const storageApi = createStorageApi();
registerStorageApi(storageApi);
const storageModule: Module = {
  name: 'storage',
  routes: [
    {
      path: '/storage',
      element: <StorageExplorer />,
      layout: 'dashboard',
      label: 'storage.title',
      nav: true,
      order: 40,
      moduleName: 'storage',
      icon: <FolderIcon size={18} />,
      group: 'storage', // or a new group
    },
  ],
  locales: { en: enLocales, ar: arLocales },
  navGroups: [
    { id: 'storage', label: 'storage.title', order: 10, icon: <File size={10} className="shrink-0" /> },
  ],
};

export default storageModule