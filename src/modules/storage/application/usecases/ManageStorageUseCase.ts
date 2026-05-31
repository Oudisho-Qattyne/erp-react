// src/modules/storage/application/usecases/createManageStorageUseCase.ts
import type { IManageStorageRepository } from "../../domain/repository/IManageStorageRepository";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { StorageFile, StorageFolder, StorageItem } from "../../domain/entities/FileSystemEntry";
import type { StorageItemDto } from "../dtos/storageItem";
import { storageItem2StorageItemDto, storageItems2StorageItemDtos } from "../mappers/StorageItem2StorageItemDto";


export const createManageStorageUseCase = (repository: IManageStorageRepository) => {
  return {
    // Folder operations
    listRootLevel: async (): Promise<DomainResponse<StorageItemDto[]>> => {
      const res = await repository.getRootItems()
      const storageItemsDtos = storageItems2StorageItemDtos(res.data)
      const newRes = {
        status: res.status,
        data: storageItemsDtos,
      }
      return newRes;
    },

    getFolderContents: async (folderId: string): Promise<DomainResponse<StorageItemDto[]>> => {
      const res = await repository.getFolderContents(folderId)
      let storageItemsDtos: StorageItemDto[] = []
      if (res.data.children)
        storageItemsDtos = storageItems2StorageItemDtos(res.data.children)
      const newRes = {
        status: res.status,
        data: storageItemsDtos,
      }
      return newRes
    },
    getFolderContentsByPath: async (path: string): Promise<DomainResponse<StorageItemDto[]>> => {
      const res = await repository.getFolderContentsByPath(path)
      let storageItemsDtos: StorageItemDto[] = []
      if (res.data)
        storageItemsDtos = storageItems2StorageItemDtos(res.data)
      const newRes = {
        status: res.status,
        data: storageItemsDtos,
      }
      return newRes
    },


    createFolder: async (parentId: string, name: string): Promise<DomainResponse<StorageItemDto>> => {
      const res = await repository.createFolder(parentId, name)
      let storageItemsDto: StorageItemDto
      if (res.data) {

        storageItemsDto = storageItem2StorageItemDto(res.data)
        const newRes = {
          status: res.status,
          data: storageItemsDto,
        }
        return (newRes);
      }
      else{
        throw Error("Faild to get storage Item")
    }
    },

    // File operations
    uploadFile: async (parentId: string, file: File, name: string, isSecure: boolean): Promise<DomainResponse<StorageFile>> => {
      return (repository.uploadFile(parentId, file, name ? name : file.name, isSecure));
    },


    renameFolder: async (folderId: string, name: string): Promise<DomainResponse<StorageFolder>> => {
      return (repository.renameFolder(folderId, name));
    },

    deleteFolder: async (folderId: string): Promise<void> => {
      const response = await repository.deleteFolder(folderId);
      //   if (response.status !== "Success") {
      //     throw new Error(response.message || "Failed to delete folder");
      //   }
    },

    // moveFolder: async (folderId: string, newParentId: string | null): Promise<StorageFolder> => {
    //   const dto: MoveItemDTO = { new_parent_id: newParentId };
    //   return(repository.moveFolder(folderId, dto));
    // },


    // moveFile: async (fileId: string, newParentId: string | null): Promise<StorageFile> => {
    //   const dto: MoveItemDTO = { new_parent_id: newParentId };
    //   return(repository.moveFile(fileId, dto));
    // },

    deleteFile: async (fileId: string): Promise<void> => {
      const response = await repository.deleteFile(fileId);
      //   if (response.status !== "Success") {
      //     throw new Error(response.message || "Failed to delete file");
      //   }
    },

    // getFileDownloadUrl: async (fileId: string): Promise<string> => {
    //   return repository.getFileDownloadUrl(fileId);
    // },
  };
};