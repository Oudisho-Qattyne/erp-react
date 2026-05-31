
export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  size?: number;
  mimeType?: string;
  url?: string;
  children?: FileItem[];
}

export interface StorageApi {
  // File operations
  listFiles: (path?: string) => Promise<FileItem[]>;
  getFile: (id: string) => Promise<FileItem | null>;
  createFolder: (name: string, parentId?: string) => Promise<FileItem>;
  uploadFile: (file: File, parentId?: string) => Promise<FileItem>;
  deleteItem: (id: string) => Promise<void>;
  renameItem: (id: string, newName: string) => Promise<FileItem>;
  moveItem: (id: string, targetParentId: string) => Promise<FileItem>;
  // UI components (optional)
  FileExplorerComponent?: React.ComponentType<any>;
  FilePickerComponent?: React.ComponentType<any>;
}

let storageApi: StorageApi | null = null;

export const registerStorageApi = (api: StorageApi): void => {
  storageApi = api;
};

export const getStorageApi = (): StorageApi | null => {
  return storageApi;
};