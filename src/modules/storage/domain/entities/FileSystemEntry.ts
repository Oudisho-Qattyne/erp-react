export type StorageItemType = 'file' | 'folder';

export interface StorageItemBase {
  id: string;
  owner_id: number;
  parent_id: string | null;
  type: StorageItemType;
  name: string;
  path: string;
  created_at: string;
  updated_at: string;
}

export interface StorageFile extends StorageItemBase {
  type: 'file';
  mime_type: string | null;
  extension: string | null;
  size: number | null;
  is_secure: boolean;
  download_url: string | null;
}

export interface StorageFolder extends StorageItemBase {
  type: 'folder';
  children?: (StorageFolder | StorageFile)[];
}

export type StorageItem = StorageFolder | StorageFile;