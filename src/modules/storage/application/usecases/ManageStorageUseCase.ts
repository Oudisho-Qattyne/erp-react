// src/modules/storage/application/usecases/createManageStorageUseCase.ts
import type { IManageStorageRepository } from "../../domain/repository/IManageStorageRepository";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { StorageItem } from "../../domain/entities/FileSystemEntry";


export const createManageStorageUseCase = (repository: IManageStorageRepository) => {
  return {
    // Folder operations
    listRootLevel: async (): Promise<DomainResponse<StorageItem[]>> => {
      return(repository.getRootItems());
    },

    getFolderContents: async (folderId: string):Promise<DomainResponse<StorageItem>> => {
      return(repository.getFolderContents(folderId));
    },

    // createFolder: async (data: CreateFolderDTO): Promise<DomainResponse<StorageItem>> => {
    //   return(repository.createFolder(data));
    // },

    // renameFolder: async (folderId: string, data: UpdateFolderDTO): Promise<StorageFolder> => {
    //   return(repository.renameFolder(folderId, data));
    // },

    // deleteFolder: async (folderId: string): Promise<void> => {
    //   const response = await repository.deleteFolder(folderId);
    //   if (response.status !== "Success") {
    //     throw new Error(response.message || "Failed to delete folder");
    //   }
    // },

    // moveFolder: async (folderId: string, newParentId: string | null): Promise<StorageFolder> => {
    //   const dto: MoveItemDTO = { new_parent_id: newParentId };
    //   return(repository.moveFolder(folderId, dto));
    // },

    // // File operations
    // uploadFile: async (data: UploadFileDTO): Promise<StorageFile> => {
    //   return(repository.uploadFile(data));
    // },

    // moveFile: async (fileId: string, newParentId: string | null): Promise<StorageFile> => {
    //   const dto: MoveItemDTO = { new_parent_id: newParentId };
    //   return(repository.moveFile(fileId, dto));
    // },

    // deleteFile: async (fileId: string): Promise<void> => {
    //   const response = await repository.deleteFile(fileId);
    //   if (response.status !== "Success") {
    //     throw new Error(response.message || "Failed to delete file");
    //   }
    // },

    // getFileDownloadUrl: async (fileId: string): Promise<string> => {
    //   return repository.getFileDownloadUrl(fileId);
    // },
  };
};