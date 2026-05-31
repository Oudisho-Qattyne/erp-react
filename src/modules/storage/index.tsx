// src/modules/storage/index.tsx
import { registerModule, type Module } from '../../core/moduleRegistry';
import enLocales from './presentation/locales/en.json';
import arLocales from './presentation/locales/ar.json';
import type { StorageApi } from '../../core/registry/storage/storageRegistry';
import { StorageExplorer } from './presentation/pages/StorageExplorer';
import { File, FolderIcon } from 'lucide-react';

// Implement the actual storage API (using your backend or mock)
// const createStorageApi = (): StorageApi => {
//   // Use your existing API client, e.g., the one from core context
// //   const apiClient = ... // you can get via useApiClient inside a hook, but here we need a pure object
//   // For simplicity, we'll implement a mock – replace with real API calls.
//   return {
//     listFiles: async (path) => {
//       // call your backend endpoint e.g., `/storage/list?path=${path}`
//       return [];
//     },
//     uploadFile: async (file, parentId) => {
        
//     },
//     // ... implement all methods
//     // Optional: provide UI components
//     FileExplorerComponent: StorageExplorer,
//   };
// };

// Register the API once
// const storageApi = createStorageApi();
// registerStorageApi(storageApi);

// Also register as a normal module (routes, etc.)
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