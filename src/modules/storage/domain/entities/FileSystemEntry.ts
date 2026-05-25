export type StorageItemType = 'file' | 'folder';
export interface ParentChain {
  id:string;
  path:string;
  name:string
}
export interface StorageItemBase {
  id: string;
  owner_id: number;
  parent_id: string | null;
  type: StorageItemType;
  name: string;
  path: string;
  parents_chain: ParentChain[]
  created_at: string;
  updated_at: string;
}

export interface StorageFile extends StorageItemBase {
  type: 'file';
  mime_type: string | null;
  extension: string | null;
  size: number;
  is_secure: boolean;
  download_url: string | null;
}

export interface StorageFolder extends StorageItemBase {
  type: 'folder';
  children?: StorageItem[];
}

export type StorageItem = StorageFolder | StorageFile;