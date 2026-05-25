// src/modules/storage/presentation/hooks/useManageStorage.ts
import { useState, useCallback } from "react";
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider";
import type { StorageItem, StorageFolder } from "../../domain/entities/FileSystemEntry";
import { createManageStorageUseCase } from "../../application/usecases/ManageStorageUseCase";
import { createManageStorageRepository } from "../../infrastructure/repositories/ManageStorageRepository";
import type { StorageItemDto } from "../../application/dtos/storageItem";
import type { IApi } from "@svar-ui/react-filemanager";

export interface UseManageStorageReturn {
    data: StorageItemDto[];
    loading: boolean;
    error: string | null;
    loadRoot: () => Promise<void>;
    loadFolder: (folderId: string, apiRef: any) => Promise<void>;
    loadFolderByPath: (path: string, api: any) => Promise<void>;
    createFolder: (parentId: string, name:string , api: any) => Promise<void>;
    uploadFile: (parentId: string,file:File , isSecure:boolean ,  name:string , api: any) => Promise<void>;
    clearError: () => void;
}

export const useManageStorage = (): UseManageStorageReturn => {
    const apiClient = useApiClient();
    const [data, setData] = useState<StorageItemDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const repository = createManageStorageRepository(apiClient);
    const useCase = createManageStorageUseCase(repository);

    const clearError = useCallback(() => setError(null), []);

    const loadRoot = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await useCase.listRootLevel();
            setData(res.data);
        } catch (err: any) {
            switch (err.status) {
                case 403:
                    setError("Forbiden")
                    break;

                default:
                    setError(err.message || "Failed to load root items");
                    break;
            }

        } finally {
            setLoading(false);
        }
    }, [useCase]);

    const loadFolder = useCallback(async (folderId: string, api: any) => {
        setLoading(true);
        setError(null);
        const ids = data.filter(i => i.id == folderId)
        console.log(ids, data, folderId);

        if (ids.length > 0) {
            console.log(ids);

            const id = ids[0]._id
            try {
                const res = await useCase.getFolderContents(id);
                //   setData(res.data);
                api.exec("provide-data", { data: res.data, folderId });
            } catch (err: any) {
                switch (err.status) {
                    case 403:
                        setError("Forbiden")
                        break;

                    default:
                        setError(err.message || `Failed to load folder ${folderId}`);
                        break;
                }

            } finally {
                setLoading(false);
            }
        }
        else {
            setLoading(false);
        }

    }, [useCase]);


    const loadFolderByPath = useCallback(async (path: string, api: any) => {
        setLoading(true);
        setError(null);
        try {
            const res = await useCase.getFolderContentsByPath(path);
            //   setData(res.data);
            console.log(res.data);
            
            api.exec("provide-data", { data: res.data, id: path });
        } catch (err: any) {
            switch (err.status) {
                case 403:
                    setError("Forbiden")
                    break;

                default:
                    setError(err.message || `Failed to load folder ${path}`);
                    break;
            }

        } finally {
            setLoading(false);
        }

    }, [useCase]);


    const createFolder = useCallback(async (parent: string , name:string , api: IApi) => {
        setLoading(true);
        setError(null);
        try {
            console.log(parent);
            
            const storageItem = api.getFile(parent)
            const res = await useCase.createFolder(storageItem?._id , name )
            loadFolderByPath(storageItem.id , api)
            // api.exec("", { data: res.data, id:  });
        } catch (err: any) {
            switch (err.status) {
                case 403:
                    setError("Forbiden")
                    break;

                default:
                    setError(err.message || `Failed to create folder`);
                    break;
            }

        } finally {
            setLoading(false);
        }

    }, [useCase]);

    const uploadFile = useCallback(async (parent: string , file:File, isSecure:boolean = true ,name:string, api: IApi) => {
        setLoading(true);
        setError(null);
        try {
            const storageItem = api.getFile(parent)
            const res = await useCase.uploadFile(storageItem?._id , file, isSecure )
            // api.exec("", { data: res.data, id:  });
        } catch (err: any) {
            switch (err.status) {
                case 403:
                    setError("Forbiden")
                    break;

                default:
                    setError(err.message || `Failed to create folder`);
                    break;
            }

        } finally {
            setLoading(false);
        }

    }, [useCase]);
    return {
        data,
        loading,
        error,
        loadRoot,
        loadFolder,
        loadFolderByPath,
        createFolder,
        uploadFile,
        clearError,
    };
};