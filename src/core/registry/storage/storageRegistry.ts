import type { StorageItemDto } from "../../../modules/storage/application/dtos/storageItem";

export interface FileExplorerProps {
  /** Optional folder ID to start the explorer at a specific folder */
  folderId?: string;
  /** Callback when selection changes (files/folders selected) */
  onSelectionChange?: (items: StorageItemDto[]) => void;
  /** Whether to hide the toolbar (add folder, upload, delete, rename) */
  hideToolbar?: boolean;
  /** Allowed file extensions (e.g. ['jpg', 'png']). Leave empty to allow all. */
  fileTypes?: string[];
}

export interface FilePickerProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
  /** Callback when user confirms selection (returns selected items) */
  onSelect: (items: StorageItemDto[]) => void;
  /** Optional starting folder ID */
  folderId?: string;
  /** Whether multiple items can be selected */
  multiple?: boolean;
  /** Allowed file extensions (e.g. ['pdf', 'jpg']) */
  fileTypes?: string[];
}

export interface FileExplorerDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
  /** Optional starting folder ID */
  folderId?: string;
  /** Callback when selection changes */
  onSelectionChange?: (items: StorageItemDto[]) => void;
  /** Allowed file extensions (e.g. ['pdf', 'jpg']) */
  fileTypes?: string[];
}

export interface StorageApi {
  /** Component that renders a full file manager (browser) */
  FileExplorerComponent?: React.ComponentType<FileExplorerProps>;
  /** Component that renders a file picker dialog */
  FilePickerComponent?: React.ComponentType<FilePickerProps>;
  /** Component that renders a file explorer dialog */
  FileExplorerDialogComponent?: React.ComponentType<FileExplorerDialogProps>;
}
let storageApi: StorageApi | null = null;

export const registerStorageApi = (api: StorageApi): void => {
  storageApi = api;
};

export const getStorageApi = (): StorageApi | null => {
  return storageApi;
};