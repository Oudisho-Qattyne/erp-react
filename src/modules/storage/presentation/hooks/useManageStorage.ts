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

export interface UseManageStorageReturn {
    data: StorageItemDto[];
    loading: boolean;
    error: string | null;
    loadRoot: () => Promise<void>;
    loadFolder: (folderId: string, apiRef: any) => Promise<void>;
    loadFolderByPath: (path: string, api: any) => Promise<void>;
    createFolder: (parentId: string, name: string, api: any) => Promise<void>;
    uploadFile: (parentId: string, file: File, isSecure: boolean, name: string, api: any) => Promise<void>;
    deleteFolder: (id: string) => Promise<void>;
    deleteFile: (id: string) => Promise<void>;
    getItemById: (id:string) => Promise<void>;
    renameFolder: (id: string, name: string) => Promise<void>;
    clearError: () => void;
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

    const loadFolder = useCallback(async (folderId: string, api: any) => {
        setLoading(true);
        setError(null);
        const ids = data.filter(i => i.id == folderId)

        if (ids.length > 0) {

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


    const createFolder = useCallback(async (parent: string, name: string, api: IApi) => {
        setLoading(true);
        setError(null);
        try {
            const storageItem = api.getFile(parent);
            if (storageItem) {

                const res = await useCase.createFolder(storageItem?._id, name);
                await loadFolderByPath(storageItem?.id, api);
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

    const uploadFile = useCallback(async (parent: string, file: File, isSecure: boolean = true, name: string, api: IApi) => {
        setLoading(true);
        setError(null);
        try {
            const storageItem = api.getFile(parent);
            if (storageItem) {

                const res = await useCase.uploadFile(storageItem?._id, file, name, isSecure);
                await loadFolderByPath(storageItem?.id, api);
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

    const deleteFolder = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await useCase.deleteFolder(id);
            toast.success(
                language === 'ar'
                    ? 'تم حذف المجلد بنجاح'
                    : 'Folder deleted successfully'
            );
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

    const deleteFile = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await useCase.deleteFile(id);
            toast.success(
                language === 'ar'
                    ? 'تم حذف الملف بنجاح'
                    : 'File deleted successfully'
            );
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

    const renameFolder = useCallback(async (id: string, name: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await useCase.renameFolder(id, name);
            toast.success(
                language === 'ar'
                    ? `تم تغيير الاسم إلى "${name}" بنجاح`
                    : `Renamed to "${name}" successfully`
            );
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