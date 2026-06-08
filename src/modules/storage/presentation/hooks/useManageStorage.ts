// src/modules/storage/presentation/hooks/useManageStorage.ts
import { useState, useCallback } from "react";
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider";
import type { StorageItem, StorageFolder } from "../../domain/entities/FileSystemEntry";
import { createManageStorageUseCase } from "../../application/usecases/ManageStorageUseCase";
import { createManageStorageRepository } from "../../infrastructure/repositories/ManageStorageRepository";
import type { StorageItemDto } from "../../application/dtos/storageItem";
import type { IApi } from "@svar-ui/react-filemanager";
import { toast } from "sonner";
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";

export interface UseManageStorageReturn {
    data: StorageItemDto[];
    loading: boolean;
    error: string | null;
    loadRoot: () => Promise<void>;
    loadFolder: (folderId: string, apiRef: any , clipPath?:string) => Promise<void>;
    loadFolderByPath: (path: string, api: any , clipPath?:string) => Promise<void>;
    createFolder: (parentId: string, name: string, api: any, clipPath?:string) => Promise<void>;
    uploadFile: (parentId: string, file: File, isSecure: boolean, name: string, api: any, clipPath?:string) => Promise<void>;
    deleteFolder: (parentId: string,id: string,api: any, clipPath?:string) => Promise<void>;
    deleteFile: (parentId: string,id: string,api: any, clipPath?:string) => Promise<void>;
    getItemById: (id:string) => Promise<DomainResponse<StorageItem>>;
    renameFolder: (parentId: string,id: string, name: string,api: any, clipPath?:string) => Promise<void>;
    clearError: () => void;
}

/**
 * Removes the first segment of `path` if it equals `segmentPath`.
 * Both inputs must start with '/'.
 * @example removeFirstSegmentIfMatches("/root/folder/file", "/root") -> "/folder/file"
 * @example removeFirstSegmentIfMatches("/root", "/root") -> "/"
 * @example removeFirstSegmentIfMatches("/root/folder", "/folder") -> "/root/folder"
 */
function removeFirstSegmentIfMatches(path: string, segmentPath: string): string {
    if (!path.startsWith('/') || !segmentPath.startsWith('/')) {
      throw new Error('Both paths must start with "/"');
    }
    if (path === '/') return '/';
  
    // Find the end of the first segment (after the leading '/')
    const nextSlash = path.indexOf('/', 1);
    const firstSegment = nextSlash === -1 ? path.slice(1) : path.slice(1, nextSlash);
    const targetSegment = segmentPath.slice(1); // remove leading '/'
  
    if (firstSegment === targetSegment) {
      // Remove the first segment and its preceding '/'
      const remaining = nextSlash === -1 ? '' : path.slice(nextSlash);
      return remaining === '' ? '/' : remaining;
    }
    return path;
  }


  /**
 * Merges two absolute paths (both starting with '/') into one normalized path.
 * Removes redundant slashes and handles root cases.
 * @example mergePaths("/root", "/folder") -> "/root/folder"
 * @example mergePaths("/root/", "/folder/") -> "/root/folder"
 * @example mergePaths("/", "/folder") -> "/folder"
 * @example mergePaths("/", "/") -> "/"
 */
function mergePaths(path1: string, path2: string): string {
    if (!path1.startsWith('/') || !path2.startsWith('/')) {
      throw new Error('Both paths must start with "/"');
    }
  
    // Clean: remove trailing slash from first path, leading slash from second
    const cleaned1 = path1 === '/' ? '' : path1.replace(/\/+$/, '');
    const cleaned2 = path2.replace(/^\/+/, '');
  
    if (cleaned1 === '' && cleaned2 === '') return '/';
    return '/' + [cleaned1, cleaned2].filter(Boolean).join('/');
  }


export const useManageStorage = (): UseManageStorageReturn => {
    const apiClient = useApiClient();
    const { language } = useLanguage();
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

    const loadFolder = useCallback(async (folderId: string, api: any , clipPath?:string) => {
        setLoading(true);
        setError(null);
            try {
                const res = await useCase.getFolderContents(folderId);
                if(clipPath){
                    res.data.forEach(i => {
                        i.id = removeFirstSegmentIfMatches(i.id , clipPath)
                    })
                }
                console.log("loadFolder : " , res.data);
                
                  setData(res.data);
                //   console.log(res.data);
                //   if(res.data.length > 0){
                //       api.exec("set-path", { id:res.data[0].path });
                //   }
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
        // }
        // else {
            setLoading(false);
        // }

    }, [useCase]);


    const loadFolderByPath = useCallback(async (path: string, api: any , clipPath?:string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await useCase.getFolderContentsByPath(path);
            if(clipPath){
                console.log(res.data);
                res.data.forEach(i => {
                    i.id = removeFirstSegmentIfMatches(i.id , clipPath)
                })
            }
            //   setData(res.data);
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


    const createFolder = useCallback(async (parent: string, name: string, api: IApi, clipPath?:string) => {
        setLoading(true);
        setError(null);
        try {
            console.log(removeFirstSegmentIfMatches(parent , clipPath));
            
            const storageItem = api.getFile(parent);
            // console.log(mergePaths(storageItem?.id , clipPath  ));
            
            if (storageItem) {
                console.log(storageItem?._id , parent , storageItem);
                
                // const res = await useCase.createFolder(storageItem?._id, name);
                await loadFolderByPath(mergePaths(storageItem?.id , clipPath  ), api , clipPath );
                toast.success(
                    language === 'ar'
                        ? `تم إنشاء المجلد "${name}" بنجاح`
                        : `Folder "${name}" created successfully`
                );
            }
        } catch (err: any) {
            const errMsg = err.message || `Failed to create folder`;
            switch (err.status) {
                case 403:
                    setError("Forbiden");
                    toast.error(
                        language === 'ar'
                            ? "غير مصرح لك بإنشاء مجلد هنا"
                            : "You are not authorized to create a folder here"
                    );
                    break;
                default:
                    setError(errMsg);
                    toast.error(
                        language === 'ar'
                            ? `فشل إنشاء المجلد: ${errMsg}`
                            : `Failed to create folder: ${errMsg}`
                    );
                    break;
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [useCase, language, loadFolderByPath]);

    const uploadFile = useCallback(async (parent: string, file: File, isSecure: boolean = true, name: string, api: IApi , clipPath?:string) => {
        setLoading(true);
        setError(null);
        try {
            const storageItem = api.getFile(removeFirstSegmentIfMatches(parent , clipPath));
            if (storageItem) {

                const res = await useCase.uploadFile(storageItem?._id, file, name, isSecure);
                await loadFolderByPath(storageItem?.id, api , clipPath);
                toast.success(
                    language === 'ar'
                        ? `تم رفع الملف "${name}" بنجاح`
                        : `File "${name}" uploaded successfully`
                );
            }
            else{
                throw Error("Faild to get storage Item")
            }
        } catch (err: any) {
            const errMsg = err.message || `Failed to upload file`;
            switch (err.status) {
                case 403:
                    setError("Forbiden");
                    toast.error(
                        language === 'ar'
                            ? "غير مصرح لك برفع ملفات هنا"
                            : "You are not authorized to upload files here"
                    );
                    break;
                default:
                    setError(errMsg);
                    toast.error(
                        language === 'ar'
                            ? `فشل رفع الملف: ${errMsg}`
                            : `Failed to upload file: ${errMsg}`
                    );
                    break;
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [useCase, language, loadFolderByPath]);

    const deleteFolder = useCallback(async (parent : string , id: string,api: any, clipPath?:string) => {
        setLoading(true);
        setError(null);

        try {
            console.log(removeFirstSegmentIfMatches(parent , clipPath));
            
            const storageItem = false;
            if (storageItem) {
                const res = await useCase.deleteFolder(id);
                // await loadFolderByPath(storageItem?.id, api , clipPath);
                toast.success(
                    language === 'ar'
                    ? 'تم حذف المجلد بنجاح'
                    : 'Folder deleted successfully'
                );
            }
        } catch (err: any) {
            const errMsg = err.message || `Failed to delete folder`;
            switch (err.status) {
                case 403:
                    setError("Forbiden");
                    toast.error(
                        language === 'ar'
                            ? "غير مصرح لك بحذف هذا المجلد"
                            : "You are not authorized to delete this folder"
                    );
                    break;
                default:
                    setError(errMsg);
                    toast.error(
                        language === 'ar'
                            ? `فشل حذف المجلد: ${errMsg}`
                            : `Failed to delete folder: ${errMsg}`
                    );
                    break;
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [useCase, language]);

    const deleteFile = useCallback(async (parent:string , id: string,api: any, clipPath?:string) => {
        setLoading(true);
        setError(null);
        try {
            const storageItem = api.getFile(removeFirstSegmentIfMatches(parent , clipPath));
            if (storageItem) {
            const res = await useCase.deleteFile(id);
            await loadFolderByPath(storageItem?.id, api , clipPath);

            toast.success(
                language === 'ar'
                    ? 'تم حذف الملف بنجاح'
                    : 'File deleted successfully'
            );
        }
        } catch (err: any) {
            const errMsg = err.message || `Failed to delete file`;
            switch (err.status) {
                case 403:
                    setError("Forbiden");
                    toast.error(
                        language === 'ar'
                            ? "غير مصرح لك بحذف هذا الملف"
                            : "You are not authorized to delete this file"
                    );
                    break;
                default:
                    setError(errMsg);
                    toast.error(
                        language === 'ar'
                            ? `فشل حذف الملف: ${errMsg}`
                            : `Failed to delete file: ${errMsg}`
                    );
                    break;
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [useCase, language]);

    const renameFolder = useCallback(async (parent:string , id: string, name: string,api: any, clipPath?:string) => {
        setLoading(true);
        setError(null);
        try {
            const storageItem = api.getFile(removeFirstSegmentIfMatches(parent , clipPath));
            if (storageItem) {
            const res = await useCase.renameFolder(id, name);
            await loadFolderByPath(storageItem?.id, api , clipPath);

            toast.success(
                language === 'ar'
                    ? `تم تغيير الاسم إلى "${name}" بنجاح`
                    : `Renamed to "${name}" successfully`
            );
        }
        } catch (err: any) {
            const errMsg = err.message || `Failed to rename`;
            switch (err.status) {
                case 403:
                    setError("Forbiden");
                    toast.error(
                        language === 'ar'
                            ? "غير مصرح لك بإعادة التسمية"
                            : "You are not authorized to rename this item"
                    );
                    break;
                default:
                    setError(errMsg);
                    toast.error(
                        language === 'ar'
                            ? `فشلت إعادة التسمية: ${errMsg}`
                            : `Failed to rename: ${errMsg}`
                    );
                    break;
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [useCase, language]);

    const getItemById = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await useCase.getItemById(id);
            // toast.success(
            //     language === 'ar'
            //         ? `تم تغيير الاسم إلى "${name}" بنجاح`
            //         : `Renamed to "${name}" successfully`
            // );
            return(res)
        } catch (err: any) {
            const errMsg = err.message || `Failed to rename`;
            switch (err.status) {
                case 403:
                    setError("Forbiden");
                    toast.error(
                        language === 'ar'
                            ? "غير مصرح لك بعرض هذا الملف"
                            : "You are not authorized to rename this item"
                    );
                    break;
                default:
                    setError(errMsg);
                    toast.error(
                        language === 'ar'
                            ? `فشل عرض الملف: ${errMsg}`
                            : `Failed to rename: ${errMsg}`
                    );
                    break;
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [useCase, language]);
    
    return {
        data,
        loading,
        error,
        loadRoot,
        loadFolder,
        loadFolderByPath,
        createFolder,
        renameFolder,
        uploadFile,
        deleteFolder,
        deleteFile,
        getItemById,
        clearError,
    };
};