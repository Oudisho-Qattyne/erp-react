import type { ApiClient } from '../../../../core/domain/common/api/ApiClient';
import type { DomainResponse } from '../../../../core/domain/common/responce/DomainResponse';
import type { StorageFolder, StorageItem } from '../../domain/entities/FileSystemEntry';
import type { IManageStorageRepository } from '../../domain/repository/IManageStorageRepository';


export const createManageStorageRepository = (
    apiClient: ApiClient
): IManageStorageRepository => {
    const baseUrl = '/storage-management';

    return {
        // Root & listing
        getRootItems: async (): Promise<DomainResponse<StorageItem[]>> => {
            return apiClient.get(`${baseUrl}`);
        },

        getItemById: async (folderId: string): Promise<DomainResponse<StorageFolder>> => {
            return apiClient.get(`${baseUrl}/folders/${folderId}`);
        },

        getFolderContents: async (folderId: string): Promise<DomainResponse<StorageFolder>> => {
            return apiClient.get(`${baseUrl}/folders/${folderId}`);
        },
        getFolderContentsByPath: async (path: string): Promise<DomainResponse<StorageItem[]>> => {
            return apiClient.get(`${baseUrl}/search` , {params:{path:path}});
        },
        // Folder operations
        // createFolder: async (data: CreateFolderDTO): Promise<DomainResponse<StorageFolder>> => {
        //   return apiClient.post(`${baseUrl}/folders`, data);
        // },

        // renameFolder: async (folderId: string, data: UpdateFolderDTO): Promise<DomainResponse<StorageFolder>> => {
        //   return apiClient.put(`${baseUrl}/folders/${folderId}`, data);
        // },

        // deleteFolder: async (folderId: string): Promise<DomainResponse<void>> => {
        //   return apiClient.delete(`${baseUrl}/folders/${folderId}`);
        // },

        // moveFolder: async (folderId: string, data: MoveItemDTO): Promise<DomainResponse<StorageFolder>> => {
        //   return apiClient.put(`${baseUrl}/folders/${folderId}/move`, data);
        // },

        // // File operations
        // uploadFile: async (data: UploadFileDTO): Promise<DomainResponse<StorageFile>> => {
        //   const formData = new FormData();
        //   formData.append('file', data.file);
        //   if (data.parent_id) formData.append('parent_id', data.parent_id);
        //   if (data.is_secure !== undefined) formData.append('is_secure', String(data.is_secure));
        //   return apiClient.post(`${baseUrl}/files/upload`, formData, {
        //     headers: { 'Content-Type': 'multipart/form-data' },
        //   });
        // },

        // moveFile: async (fileId: string, data: MoveItemDTO): Promise<DomainResponse<StorageFile>> => {
        //   return apiClient.put(`${baseUrl}/files/${fileId}/move`, data);
        // },

        // deleteFile: async (fileId: string): Promise<DomainResponse<void>> => {
        //   return apiClient.delete(`${baseUrl}/files/${fileId}`);
        // },

        // getFileDownloadUrl: async (fileId: string): Promise<string> => {
        //   // The backend returns a signed URL; we just construct the endpoint.
        //   // The actual signed URL is obtained by calling the download endpoint.
        //   // We'll return the full endpoint URL; the caller will use it directly.
        //   return `${apiClient.getBaseURL()}/${baseUrl}/files/${fileId}/download`;
        // },
    };
};