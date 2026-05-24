import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import {type  DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { StorageFolder, StorageItem } from "../../domain/entities/FileSystemEntry";

export class CustomRestDataProvider {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  // Load the root file list (what the file manager calls "drive")
  async loadInfo(): Promise<any> {
    // You can return drive statistics (used / free space) if your API provides them.
    // For now, return a placeholder.
    return { stats: { used: 0, free: 0, total: 0 } };
  }

  // Load files at a given path (id is the folder UUID or path)
  async loadFiles(parentId?: string): Promise<any[]> {
    let url = '/storage-management';
    if (parentId) {
      url = `/storage-management/folders/${parentId}`;
    }
    const response = await this.apiClient.get<DomainResponse<StorageItem | StorageItem[]>>(url);
    // The API returns { data: [...] } for root, or { data: { children: [...] } } for folders.
    const items = response.data;
    const fileList = Array.isArray(items) ? items : (items.type === 'folder' ? items.children : [] );
    // Map to the format expected by the file manager
    return fileList.map((item: any) => ({
      id: item.id,               // Use UUID
      size: item.type === 'folder' ? 4096 : (item.size || 0),
      date: new Date(item.created_at),
      type: item.type,
      lazy: item.type === 'folder', // folders are lazy
      name: item.name,           // The file manager also needs 'name'
    }));
  }

  // Called when a folder is expanded (lazy loading)
  async loadChildren(parentId: string): Promise<any[]> {
    const response = await this.apiClient.get<DomainResponse<StorageFolder>>(`/storage-management/folders/${parentId}`);
    const folder = response.data;
    const children = folder.children || [];
    return children.map((item: any) => ({
      id: item.id,
      size: item.type === 'folder' ? 4096 : (item.size || 0),
      date: new Date(item.created_at),
      type: item.type,
      lazy: item.type === 'folder',
      name: item.name,
    }));
  }

//   // Create a new folder
//   async createFolder(name: string, parentId?: string): Promise<any> {
//     const payload: any = { name };
//     if (parentId) payload.parent_id = parentId;
//     const response = await this.apiClient.post('/storage-management/folders', payload);
//     return response.data;
//   }

//   // Upload a file
//   async uploadFile(file: File, parentId?: string): Promise<any> {
//     const formData = new FormData();
//     formData.append('file', file);
//     if (parentId) formData.append('parent_id', parentId);
//     formData.append('is_secure', 'false');
//     const response = await this.apiClient.post('/storage-management/files/upload', formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return response.data;
//   }

//   // Delete an item (file or folder)
//   async deleteItem(id: string, type: 'file' | 'folder'): Promise<void> {
//     if (type === 'folder') {
//       await this.apiClient.delete(`/storage-management/folders/${id}`);
//     } else {
//       await this.apiClient.delete(`/storage-management/files/${id}`);
//     }
//   }

//   // Rename an item
//   async renameItem(id: string, newName: string, type: 'file' | 'folder'): Promise<any> {
//     if (type === 'folder') {

//       return this.apiClient.put(`/storage-management/folders/${id}`, { name: newName });
//     } else {
//       // The API does not have a direct rename endpoint for files? The spec only shows rename for folders.
//       // Files may be renamed via update? We'll assume not needed or you can implement.
//       throw new Error('File rename not supported');
//     }
//   }

//   // Move an item
//   async moveItem(id: string, newParentId: string | null, type: 'file' | 'folder'): Promise<any> {
//     const payload: any = {};
//     if (newParentId) payload.new_parent_id = newParentId;
//     if (type === 'folder') {
//       return this.apiClient.put(`/storage-management/folders/${id}/move`, payload);
//     } else {
//       return this.apiClient.put(`/storage-management/files/${id}/move`, payload);
//     }
//   }
}