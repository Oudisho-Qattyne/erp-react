import React, { createContext, useContext, type ReactNode } from 'react';
import { getStorageApi, type StorageApi } from './storageRegistry';

const StorageContext = createContext<StorageApi | null>(null);

export const StorageProvider = ({ children }: { children: ReactNode }) => {
  const api = getStorageApi();
  return (
    <StorageContext.Provider value={api}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  // Do NOT throw if missing – just return null, let the caller decide.
  return context;
};