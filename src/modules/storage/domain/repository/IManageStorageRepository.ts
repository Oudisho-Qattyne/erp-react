import type { DomainResponse } from '../../../../core/domain/common/responce/DomainResponse';
import type { StorageFile, StorageFolder, StorageItem } from '../entities/FileSystemEntry';

export interface IManageStorageRepository {
  // Root level items
  getRootItems(): Promise<DomainResponse<StorageItem[]>>;

  // Get item by ID (returns folder structure or file metadata)
  getItemById(id: string): Promise<DomainResponse<StorageItem>>;

  // Get folder contents (explicitly with children)
  getFolderContents(folderId: string): Promise<DomainResponse<StorageFolder>>;

  // // Create a new folder
  // createFolder(parentId: string | null, name: string): Promise<DomainResponse<StorageFolder>>;

  // // Rename a folder
  // renameFolder(id: string, newName: string): Promise<DomainResponse<StorageFolder>>;

  // // Delete a folder
  // deleteFolder(id: string): Promise<DomainResponse<null>>;

  // // Move a folder to a new parent (null = root)
  // moveFolder(id: string, newParentId: string | null): Promise<DomainResponse<StorageFolder>>;

  // // Upload a file
  // uploadFile(parentId: string | null, file: File, isSecure?: boolean): Promise<DomainResponse<StorageFile>>;

  // // Move a file to a new parent
  // moveFile(id: string, newParentId: string | null): Promise<DomainResponse<StorageFile>>;

  // // Delete a file
  // deleteFile(id: string): Promise<DomainResponse<null>>;

  // // Download a file (returns blob with content disposition)
  // downloadFile(fileId: string, signedUrl?: string): Promise<Blob>;
}