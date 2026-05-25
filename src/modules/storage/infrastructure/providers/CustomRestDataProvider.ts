// src/modules/storage/infrastructure/providers/CustomRestDataProvider.ts
import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { StorageFolder, StorageItem } from "../../domain/entities/FileSystemEntry";

export class CustomRestDataProvider {
  private apiClient: ApiClient;
  private pathToUuidMap: Map<string, string> = new Map();

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // Helper to normalise a path (ensures it starts with '/')
  private normalisePath(rawPath: string): string {
    return rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  }

  // Helper to convert API item to file‑manager format
  private mapItem(item: any): any {
    const path = this.normalisePath(item.path || '');
    // Store mapping from path to UUID
    
    if (item.id && path) {
      this.pathToUuidMap.set(path, item.id);
    }
    return {
      id: path,                           // logical path as id
      size: item.type === 'folder' ? 4096 : (item.size || 0),
      date: new Date(item.created_at),
      type: item.type,
      lazy: item.type === 'folder',       // folders are lazy
      name: item.name,
      __uuid: item.id,                    // keep original UUID for debugging
    };
  }

  // Load drive statistics (optional)
  async loadInfo(): Promise<any> {
    // If your API provides usage stats, call it here.
    // For now, return a placeholder.
    return { stats: { used: 0, free: 0, total: 0 } };
  }

  // Load files at a given logical path (root or folder)
  async loadFiles(parentPath?: string): Promise<any[]> {
    let uuid: string | undefined;

    if (parentPath) {
      // Convert logical path back to UUID
      uuid = this.pathToUuidMap.get(parentPath);
      if (!uuid) {
        console.warn(`No UUID found for path "${parentPath}" – maybe not loaded yet.`);
        return [];
      }
    }

    const url = uuid
      ? `/storage-management/folders/${uuid}`
      : '/storage-management';

    const response = await this.apiClient.get<DomainResponse<StorageItem | StorageItem[]>>(url);
    const items = response.data;

    let fileList: any[] = [];
    if (Array.isArray(items)) {
      // Root level: items is an array of StorageItem
      fileList = items;
    } else if (items && (items as StorageFolder).type === 'folder') {
      // Folder endpoint returns { ...folder, children: [...] }
      fileList = (items as StorageFolder).children || [];
    } else {
      fileList = [];
    }

    return fileList.map(item => this.mapItem(item));
  }

  // Called when a folder is expanded (lazy loading)
  async loadChildren(parentPath: string): Promise<any[]> {
    // Reuse loadFiles with the parent logical path
    return this.loadFiles(parentPath);
  }

  // Create a new folder
  // async createFolder(name: string, parentPath?: string): Promise<any> {
  //   const payload: any = { name };
  //   if (parentPath) {
  //     const parentUuid = this.pathToUuidMap.get(parentPath);
  //     if (!parentUuid) throw new Error(`Parent folder not found: ${parentPath}`);
  //     payload.parent_id = parentUuid;
  //   }
  //   const response = await this.apiClient.post('/storage-management/folders', payload);
  //   // The response contains the new folder; map it and also update the internal mapping
  //   return this.mapItem(response.data);
  // }

  // // Upload a file
  // async uploadFile(file: File, parentPath?: string): Promise<any> {
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   if (parentPath) {
  //     const parentUuid = this.pathToUuidMap.get(parentPath);
  //     if (!parentUuid) throw new Error(`Parent folder not found: ${parentPath}`);
  //     formData.append('parent_id', parentUuid);
  //   }
  //   formData.append('is_secure', 'false');
  //   const response = await this.apiClient.post('/storage-management/files/upload', formData, {
  //     headers: { 'Content-Type': 'multipart/form-data' },
  //   });
  //   return this.mapItem(response.data);
  // }

  // // Delete an item (file or folder) by its logical path
  // async deleteItem(path: string, type: 'file' | 'folder'): Promise<void> {
  //   const uuid = this.pathToUuidMap.get(path);
  //   if (!uuid) throw new Error(`Item not found: ${path}`);
  //   if (type === 'folder') {
  //     await this.apiClient.delete(`/storage-management/folders/${uuid}`);
  //   } else {
  //     await this.apiClient.delete(`/storage-management/files/${uuid}`);
  //   }
  //   // Optionally remove from map (but not strictly necessary)
  //   this.pathToUuidMap.delete(path);
  // }

  // // Rename a folder (files not supported by API, but we keep for consistency)
  // async renameItem(path: string, newName: string, type: 'file' | 'folder'): Promise<any> {
  //   if (type === 'folder') {
  //     const uuid = this.pathToUuidMap.get(path);
  //     if (!uuid) throw new Error(`Folder not found: ${path}`);
  //     const response = await this.apiClient.put(`/storage-management/folders/${uuid}`, { name: newName });
  //     // After rename, the path changes. We must update the map.
  //     const newItem = this.mapItem(response.data);
  //     // Remove old mapping
  //     this.pathToUuidMap.delete(path);
  //     // Add new mapping (the new path is already stored by mapItem)
  //     return newItem;
  //   } else {
  //     throw new Error('File rename not supported by the backend');
  //   }
  // }

  // // Move an item to another parent folder
  // async moveItem(path: string, newParentPath: string | null, type: 'file' | 'folder'): Promise<any> {
  //   const uuid = this.pathToUuidMap.get(path);
  //   if (!uuid) throw new Error(`Item not found: ${path}`);
  //   const payload: any = {};
  //   if (newParentPath) {
  //     const newParentUuid = this.pathToUuidMap.get(newParentPath);
  //     if (!newParentUuid) throw new Error(`Target folder not found: ${newParentPath}`);
  //     payload.new_parent_id = newParentUuid;
  //   } else {
  //     // Move to root: set new_parent_id = null
  //     payload.new_parent_id = null;
  //   }
  //   let response;
  //   if (type === 'folder') {
  //     response = await this.apiClient.put(`/storage-management/folders/${uuid}/move`, payload);
  //   } else {
  //     response = await this.apiClient.put(`/storage-management/files/${uuid}/move`, payload);
  //   }
  //   // After move, the path may have changed. Re‑map the updated item.
  //   const updatedItem = this.mapItem(response.data);
  //   // Remove old mapping
  //   this.pathToUuidMap.delete(path);
  //   return updatedItem;
  // }
}