import type { DomainResponse } from '../../../../core/domain/common/responce/DomainResponse';
import type { StorageFile, StorageFolder, StorageItem } from '../entities/FileSystemEntry';

export interface IManageStorageRepository {
  // Root level items
  getRootItems(): Promise<DomainResponse<StorageItem[]>>;

  // Get item by ID (returns folder structure or file metadata)
  getItemById(id: string): Promise<DomainResponse<StorageItem>>;

  // Get folder contents (explicitly with children)
  getFolderContents(folderId: string): Promise<DomainResponse<StorageFolder>>;
  getFolderContentsByPath(path: string): Promise<DomainResponse<StorageItem[]>>;

  // Create a new folder
  createFolder(parentId: string | null, name: string): Promise<DomainResponse<StorageFolder>>;

  // Upload a file
  uploadFile(parentId: string | null, file: File, name: string, isSecure?: boolean): Promise<DomainResponse<StorageFile>>;

  // // Rename a folder
  renameFolder(id: string, newName: string): Promise<DomainResponse<StorageFolder>>;

  // Delete a folder
  deleteFolder(id: string): Promise<DomainResponse<void>>;

  // // Move a folder to a new parent (null = root)
  // moveFolder(id: string, newParentId: string | null): Promise<DomainResponse<StorageFolder>>;
  moveFolder (folderId: string, newParentId:string | null): Promise<DomainResponse<StorageFolder>>
  // // Move a file to a new parent
  moveFile (fileId: string, newParentId:string | null): Promise<DomainResponse<StorageFile>> 
  
  // moveFile(id: string, newParentId: string | null): Promise<DomainResponse<StorageFile>>;
  
  // Delete a file
  deleteFile(id: string): Promise<DomainResponse<void>>;
  
  // // Download a file (returns blob with content disposition)
  downloadFile(fileId: string, signedUrl?: string): Promise<DomainResponse<Blob>>;
}