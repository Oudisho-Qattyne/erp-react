import type { ApiClient } from '../../../../core/domain/common/api/ApiClient';
import type { DomainResponse } from '../../../../core/domain/common/responce/DomainResponse';
import type { StorageFile, StorageFolder, StorageItem } from '../../domain/entities/FileSystemEntry';
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

        getItemById: async (storageItemId: string): Promise<DomainResponse<any>> => {
            return apiClient.get(`${baseUrl}/${storageItemId}`);
        },

        getFolderContents: async (folderId: string): Promise<DomainResponse<StorageFolder>> => {
            return apiClient.get(`${baseUrl}/folders/${folderId}`);
        },
        getFolderContentsByPath: async (path: string): Promise<DomainResponse<StorageItem[]>> => {
            return apiClient.get(`${baseUrl}/search`, { params: { path: path } });
        },

        createFolder: async (parentId, name, idempotencyKey?): Promise<DomainResponse<StorageFolder>> => {
            return apiClient.post(`${baseUrl}/folders`, {
                "parent_id": parentId,
                "name": name
            }, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined)
        },

        uploadFile: async (parentId, file, name, isSecure, idempotencyKey?): Promise<DomainResponse<StorageFile>> => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', name);               // ✅ required by backend
            formData.append('is_secure', isSecure ? '1' : '0'); // ✅ send as '1' or '0'

            if (parentId) {
                formData.append('parent_id', parentId);
            }



            // ✅ Do NOT set Content-Type header – let the browser handle multipart boundary
            return apiClient.post(`${baseUrl}/files/upload`, formData, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined);
        },
        deleteFolder: async (folderId: string): Promise<DomainResponse<void>> => {
            return apiClient.delete(`${baseUrl}/folders/${folderId}`);
        },
        deleteFile: async (fileId: string): Promise<DomainResponse<void>> => {
            return apiClient.delete(`${baseUrl}/files/${fileId}`);
        },
        // Folder operations
        // createFolder: async (data: CreateFolderDTO): Promise<DomainResponse<StorageFolder>> => {
        //   return apiClient.post(`${baseUrl}/folders`, data);
        // },

        renameFolder: async (folderId: string, name: string, idempotencyKey?): Promise<DomainResponse<StorageFolder>> => {
            return apiClient.put(`${baseUrl}/folders/${folderId}`, { name }, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined);
        },
        downloadFile: async (fileId: string, signedUrl?: string): Promise<DomainResponse<Blob>> => {
            return apiClient.get(`/storage-management/files/${fileId}/download`, { responseType: 'blob' })
        },

        getFileBlob: async (storageItemId: string | number): Promise<Blob> => {
            return apiClient.get<Blob>(`${baseUrl}/${storageItemId}`, { responseType: 'blob' })
        },

        moveFolder: async (folderId: string, newParentId: string | null, idempotencyKey?): Promise<DomainResponse<StorageFolder>> => {
            return apiClient.put(`${baseUrl}/folders/${folderId}/move`, { new_parent_id : newParentId }, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined);
        },
        moveFile: async (fileId: string, newParentId: string | null, idempotencyKey?): Promise<DomainResponse<StorageFile>> => {
            return apiClient.put(`${baseUrl}/files/${fileId}/move`, { new_parent_id : newParentId }, idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined);
        },

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



        // getFileDownloadUrl: async (fileId: string): Promise<string> => {
        //   // The backend returns a signed URL; we just construct the endpoint.
        //   // The actual signed URL is obtained by calling the download endpoint.
        //   // We'll return the full endpoint URL; the caller will use it directly.
        //   return `${apiClient.getBaseURL()}/${baseUrl}/files/${fileId}/download`;
        // },
    };
};