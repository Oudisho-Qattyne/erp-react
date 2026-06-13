import { useCallback, useEffect, useState } from "react"
import type { StorageItem } from "../../domain/entities/FileSystemEntry"
import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider";
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider";
import type { StorageItemDto } from "../../application/dtos/storageItem";
import { createManageStorageRepository } from "../../infrastructure/repositories/ManageStorageRepository";
import { createManageStorageUseCase } from "../../application/usecases/ManageStorageUseCase";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import { toast } from "sonner";
import type { IApi } from "@svar-ui/react-filemanager";
import { object } from "zod";

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

    if (path === segmentPath) return '/';
    if (path.startsWith(segmentPath + '/')) {
        return path.slice(segmentPath.length) || '/';
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

    const segments = [...path1.split('/'), ...path2.split('/')];
    const filtered = segments.filter(seg => seg !== '');

    if (filtered.length === 0) return '/';
    return '/' + filtered.join('/');
}


const OP_KEYS = ["init", "getItemById", "loadRoot", "loadFolderByPath", "createFolder", "deleteFolder", "renameFolder", "uploadFile", "deleteFile", "downloadFile"] as const;

function initRecord<T>(value: T): Record<string, T> {
    return Object.fromEntries(OP_KEYS.map((k) => [k, value]));
}

export interface UseFileExplorerReturn {
    data: StorageItemDto[];
    loading: Record<string, boolean>;
    isLoading: () => boolean,
    error: Record<string, string | null>;
    hasErrors: () => boolean,
    getItemById: (id: string) => Promise<DomainResponse<StorageItemDto>>;
    loadRoot: () => Promise<void>;
    // loadFolder: (folderId: string, apiRef: any ) => Promise<void>;
    loadFolderByPath: (path: string, api: any) => Promise<void>;
    createFolder: (parentId: string, name: string, api: any) => Promise<void>;
    deleteFolder: (parentId: string, id: string, api: any) => Promise<void>;
    renameFolder: (parentId: string, id: string, name: string, api: any) => Promise<void>;
    uploadFile: (parentId: string, file: File, isSecure: boolean, name: string, api: any) => Promise<void>;
    deleteFile: (parentId: string, id: string, api: any) => Promise<void>;
    downloadFile: (id: string, signedUrl: string, api: any) => Promise<void>;
    moveStorageItem: (itemPath: string, newParentPath: string , api: IApi) => Promise<void>
    clearError: () => void;
}


export const useFileExplorer = (folderId?: string, fileTypes?: string[], previewCacheRef?: React.RefObject<Map<string, string>> | null): UseFileExplorerReturn => {

    const [rootFolder, setRootFolder] = useState<StorageItemDto | null>(null)

    const apiClient = useApiClient();
    const { language } = useLanguage();
    const [data, setData] = useState<StorageItemDto[]>([]);
    const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false));
    const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null));


    const repository = createManageStorageRepository(apiClient);
    const useCase = createManageStorageUseCase(repository);

    const filterStorageItems = (data: StorageItemDto[], fileTypes?: string[]): StorageItemDto[] => {
        if (fileTypes) {
            return data.filter(storageItem => {
                if (storageItem.type == "folder")
                    return true
                else {
                    if (storageItem.type == "file") {
                        const fileType = storageItem?.mime_type?.split('/')[0]
                        if (fileTypes?.includes(fileType)) {
                            return true
                        }
                        else {
                            return false
                        }
                    }
                }
            })
        }
        else {
            return data
        }
    }

    const preloadImagePreviews = async (items: StorageItemDto[]) => {
        if (!previewCacheRef) return;
        const imageFiles = items.filter(f => f.type === 'file' && (f as any).mime_type?.startsWith('image'));
        for (const file of imageFiles) {
            if (previewCacheRef.current.has(file.id)) continue;
            try {
                const blob = await apiClient.get<Blob>(`/storage-management/${file._id}`, { responseType: 'blob' })
                previewCacheRef.current.set(file.id, URL.createObjectURL(blob));
            } catch (error) {

            }
        }
    };

    const clearError = useCallback(() => setError(initRecord(null)), []);

    const setFunctionLoading = (functionName: string, loading: boolean) => {
        setLoading((prev) => ({ ...prev, [functionName]: loading }));
    }
    const setFunctionError = (functionName: string, error: any | null) => {
        setError((prev) => ({ ...prev, [functionName]: error }));

    }

    const getItemById = useCallback(async (id: string) => {
        setFunctionLoading("getItemById", true)
        try {
            const res = await useCase.getItemById(id);
            return (res)
        } catch (err: any) {
            const errMsg = err.message || `Failed to get item`;
            switch (err.status) {
                case 403:
                    setFunctionError("getItemById", "Forbiden");
                    toast.error(
                        language === 'ar'
                            ? "غير مصرح لك بعرض هذا الملف"
                            : "You are not authorized to rename this item"
                    );
                    break;
                default:
                    setFunctionError("getItemById", errMsg);
                    toast.error(
                        language === 'ar'
                            ? `فشل عرض الملف: ${errMsg}`
                            : `Failed to rename: ${errMsg}`
                    );
                    break;
            }
            throw err;
        } finally {
            setFunctionLoading("getItemById", false)
        }
    }, [useCase, language]);

    const loadFolderByPath = useCallback(async (path: string, api: any) => {
        setFunctionLoading("loadFolderByPath", true);
        setFunctionError("loadFolderByPath", null);
        try {
            let data = []
            if (rootFolder) {
                const res = await useCase.getFolderContentsByPath(mergePaths(rootFolder.id, path));
                res.data.forEach(i => {
                    
                    i.id = removeFirstSegmentIfMatches(i.id, rootFolder.id)
                })
                data = res.data

            }
            else {
                const res = await useCase.getFolderContentsByPath(path);
                data = res.data

            }
            data = filterStorageItems(data, fileTypes)
            await preloadImagePreviews(data);
            api.exec("provide-data", { data: data, id: path });
        } catch (err: any) {
            switch (err.status) {
                case 403:
                    setFunctionError("loadFolderByPath", "Forbiden");
                    break;
                default:
                    setFunctionError("loadFolderByPath", err.message || `Failed to load folder ${path}`);
                    break;
            }
        } finally {
            setFunctionLoading("loadFolderByPath", false);
        }
    }, [useCase, rootFolder]);

    const createFolder = useCallback(async (parent: string, name: string, api: IApi) => {
        setFunctionLoading("createFolder", true);
        setFunctionError("createFolder", null);
        try {
            if (rootFolder) {
                if (parent == "/") {
                    const res = await useCase.createFolder(rootFolder._id, name);
                }
                else {
                    const storageItem = api.getFile(parent);
                    if (storageItem) {
                        const res = await useCase.createFolder(storageItem?._id, name);
                    }
                }
            }
            else {
                const storageItem = api.getFile(parent);
                if (storageItem) {
                    const res = await useCase.createFolder(storageItem?._id, name);
                }
            }
            await loadFolderByPath(parent, api);
            toast.success(
                language === 'ar'
                    ? `تم إنشاء المجلد "${name}" بنجاح`
                    : `Folder "${name}" created successfully`
            );
        } catch (err: any) {
            const errMsg = err.message || `Failed to create folder`;
            switch (err.status) {
                case 403:
                    setFunctionError("createFolder", "Forbiden");
                    toast.error(
                        language === 'ar'
                            ? "غير مصرح لك بإنشاء مجلد هنا"
                            : "You are not authorized to create a folder here"
                    );
                    break;
                default:
                    setFunctionError("createFolder", errMsg);
                    toast.error(
                        language === 'ar'
                            ? `فشل إنشاء المجلد: ${errMsg}`
                            : `Failed to create folder: ${errMsg}`
                    );
                    break;
            }
            throw err;
        } finally {
            setFunctionLoading("createFolder", false);

        }
    }, [useCase, language, loadFolderByPath, rootFolder]);

    const deleteFolder = useCallback(async (parent: string, id: string, api: any) => {
        setFunctionLoading("deleteFolder", true);
        setFunctionError("deleteFolder", null);

        try {
            const storageItem = api.getFile(id);
            if (storageItem) {
                const res = await useCase.deleteFolder(storageItem?._id);
            }
            await loadFolderByPath(parent, api);

            toast.success(
                language === 'ar'
                    ? 'تم حذف المجلد بنجاح'
                    : 'Folder deleted successfully'
            );
        } catch (err: any) {
            const errMsg = err.message || `Failed to delete folder`;
            switch (err.status) {
                case 403:
                    setFunctionError("deleteFolder", "Forbiden");
                    toast.error(
                        language === 'ar'
                            ? "غير مصرح لك بحذف هذا المجلد"
                            : "You are not authorized to delete this folder"
                    );
                    break;
                default:
                    setFunctionError("deleteFolder", errMsg);
                    toast.error(
                        language === 'ar'
                            ? `فشل حذف المجلد: ${errMsg}`
                            : `Failed to delete folder: ${errMsg}`
                    );
                    break;
            }
            throw err;
        } finally {
            setFunctionLoading("deleteFolder", false);

        }
    }, [useCase, language]);

    const renameFolder = useCallback(async (parent: string, id: string, name: string, api: any) => {
        setFunctionLoading("renameFolder", true);
        setFunctionError("renameFolder", null);
        try {
            const storageItem = api.getFile(id);
            if (storageItem) {
                const res = await useCase.renameFolder(storageItem._id, name);
            }
            await loadFolderByPath(parent, api);

            toast.success(
                language === 'ar'
                    ? `تم تغيير الاسم إلى "${name}" بنجاح`
                    : `Renamed to "${name}" successfully`
            );
        } catch (err: any) {
            const errMsg = err.message || `Failed to rename`;
            switch (err.status) {
                case 403:
                    setFunctionError("renameFolder", "Forbiden");
                    toast.error(
                        language === 'ar'
                            ? "غير مصرح لك بإعادة التسمية"
                            : "You are not authorized to rename this item"
                    );
                    break;
                default:
                    setFunctionError("renameFolder", errMsg);
                    toast.error(
                        language === 'ar'
                            ? `فشلت إعادة التسمية: ${errMsg}`
                            : `Failed to rename: ${errMsg}`
                    );
                    break;
            }
            throw err;
        } finally {
            setFunctionLoading("renameFolder", false);
        }
    }, [useCase, language]);

    const uploadFile = useCallback(async (parent: string, file: File, isSecure: boolean = true, name: string, api: IApi) => {
        setFunctionLoading("uploadFile", true);
        setFunctionError("uploadFile", null);
        try {
            if (rootFolder) {
                if (parent == '/') {
                    const res = await useCase.uploadFile(rootFolder._id, file, name, isSecure);

                }
                else {
                    const storageItem = api.getFile(parent);
                    if (storageItem) {
                        const res = await useCase.uploadFile(storageItem?._id, file, name, isSecure);
                    }
                }
            }
            else {
                const storageItem = api.getFile(parent);
                if (storageItem) {
                    const res = await useCase.uploadFile(storageItem?._id, file, name, isSecure);
                }
            }

            await loadFolderByPath(parent, api);
            toast.success(
                language === 'ar'
                    ? `تم رفع الملف "${name}" بنجاح`
                    : `File "${name}" uploaded successfully`
            );

        } catch (err: any) {
            const errMsg = err.message || `Failed to upload file`;
            switch (err.status) {
                case 403:
                    setFunctionError("uploadFile", "Forbiden");
                    toast.error(
                        language === 'ar'
                            ? "غير مصرح لك برفع ملفات هنا"
                            : "You are not authorized to upload files here"
                    );
                    break;
                default:
                    setFunctionError("uploadFile", errMsg);
                    toast.error(
                        language === 'ar'
                            ? `فشل رفع الملف: ${errMsg}`
                            : `Failed to upload file: ${errMsg}`
                    );
                    break;
            }
            throw err;
        } finally {
            setFunctionLoading("uploadFile", false);
        }
    }, [useCase, language, loadFolderByPath]);

    const deleteFile = useCallback(async (parent: string, id: string, api: any) => {
        setFunctionLoading("deleteFile", true);
        setFunctionError("deleteFile", null);
        try {
            const storageItem = api.getFile(id);
            if (storageItem) {
                const res = await useCase.deleteFile(storageItem?._id);
            }
            await loadFolderByPath(parent, api);

            toast.success(
                language === 'ar'
                    ? 'تم حذف الملف بنجاح'
                    : 'File deleted successfully'
            );
        } catch (err: any) {
            const errMsg = err.message || `Failed to delete file`;
            switch (err.status) {
                case 403:
                    setFunctionError("deleteFile", "Forbiden");
                    toast.error(
                        language === 'ar'
                            ? "غير مصرح لك بحذف هذا الملف"
                            : "You are not authorized to delete this file"
                    );
                    break;
                default:
                    setFunctionError("deleteFile", errMsg);
                    toast.error(
                        language === 'ar'
                            ? `فشل حذف الملف: ${errMsg}`
                            : `Failed to delete file: ${errMsg}`
                    );
                    break;
            }
            throw err;
        } finally {
            setFunctionLoading("deleteFile", false);
        }
    }, [useCase, language]);

    const downloadFile = useCallback(async (id: string, signedUrl: string, api: any) => {
        setFunctionLoading("downloadFile", true);
        setFunctionError("downloadFile", null);
        try {
            const storageItem = api.getFile(id);
            if (storageItem) {
                const blob = await useCase.downloadFile(storageItem?._id);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = storageItem.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            toast.success(
                language === 'ar'
                    ? 'تم تحميل الملف بنجاح'
                    : 'File download successfully'
            );
        } catch (err: any) {
            const errMsg = err.message || `Failed to download file`;
            switch (err.status) {
                case 403:
                    setFunctionError("downloadFile", "Forbiden");
                    toast.error(
                        language === 'ar'
                            ? "غير مصرح لك بتحميل هذا الملف"
                            : "You are not authorized to download this file"
                    );
                    break;
                default:
                    setFunctionError("downloadFile", errMsg);
                    toast.error(
                        language === 'ar'
                            ? `فشل تحميل الملف: ${errMsg}`
                            : `Failed to download file: ${errMsg}`
                    );
                    break;
            }
            throw err;
        } finally {
            setFunctionLoading("downloadFile", false);
        }
    }, [useCase, language]);

    const moveStorageItem = useCallback(async (itemPath: string, newParentPath: string, api: IApi) => {
        setFunctionLoading("moveStorageItem", true);
        setFunctionError("moveStorageItem", null);
        try {
          
            let parentItem : StorageItemDto | null = null
            const storageItem = api.getFile(itemPath);
            if (newParentPath != '/' && newParentPath) {
                parentItem = api.getFile(newParentPath);
            }
            if (rootFolder) {

                if (storageItem) {
                    if (storageItem.type == "file") {
                        const res = await useCase.moveFile(storageItem?._id, parentItem ? parentItem?._id : rootFolder._id)
                    }
                    else if (storageItem.type == "folder") {
                        const res = await useCase.moveFolder(storageItem?._id, parentItem ? parentItem?._id : rootFolder._id)
                    }
                }
            }
            else {

                if (storageItem) {
                    if (storageItem.type == "file") {
                        const res = await useCase.moveFile(storageItem?._id, parentItem ? parentItem?._id : null)
                    }
                    else if (storageItem.type == "folder") {
                        const res = await useCase.moveFolder(storageItem?._id,  parentItem ? parentItem?._id : null)
                    }
                }
            }
            toast.success(
                language === 'ar'
                    ? 'تم نقل العنصر بنجاح'
                    : 'Item moved successfully'
            );
            await loadFolderByPath(newParentPath, api)
        } catch (err: any) {
            const errMsg = err.message || `Failed to move item  `;
            switch (err.status) {
                case 403:
                    setFunctionError("moveStorageItem", "Forbiden");
                    toast.error(
                        language === 'ar'
                            ? "غير مصرح لك بنقل هذا العنصر"
                            : "You are not authorized to move this item"
                    );
                    break;
                default:
                    setFunctionError("moveStorageItem", errMsg);
                    toast.error(
                        language === 'ar'
                            ? `فشل نقل العنصر: ${errMsg}`
                            : `Failed to move Item: ${errMsg}`
                    );
                    break;
            }
            throw err;
        } finally {
            setFunctionLoading("moveStorageItem", false);
        }
    }

        , [rootFolder]
    )

    const loadRoot = useCallback(async (rootFolder?: StorageItemDto) => {
        setFunctionLoading("loadRoot", true)

        setFunctionError("loadRoot", null);
        try {
            let data = []
            if (rootFolder) {
                const res = await useCase.getFolderContentsByPath(rootFolder.id);
                res.data.forEach(i => {
                    i.id = removeFirstSegmentIfMatches(i.id, rootFolder.id)
                })
                data = res.data
            }
            else {
                const res = await useCase.listRootLevel();
                data = res.data
            }
            data = filterStorageItems(data, fileTypes)
            
            await preloadImagePreviews(data);
            setData(data);
        }
        catch (err: any) {
            switch (err.status) {
                case 403:
                    setFunctionError("loadRoot", "Forbiden");
                    break;
                default:
                    setFunctionError("loadRoot", err.message || "Failed to load root items");
                    break;
            }

        } finally {
            setFunctionLoading("loadRoot", false)

        }
    }, [useCase, rootFolder, setRootFolder]);

    const init = useCallback(async () => {
        setFunctionLoading("init", true)
        setFunctionError("init", null)
        try {
            let res : StorageItemDto | null = null
            if (folderId) {
                res = await getItemById(folderId)
                setRootFolder(res?.data)
            }
            await loadRoot(res?.data)
        } catch (error) {
            setFunctionError("init", "Faild to load folder")
        }
        finally {
            setFunctionLoading("init", false)
        }
    }, [folderId]
    )

    useEffect(() => {
        init()
    }, [])

    const isLoading = useCallback(() => {
        return Object.values(loading).some(Boolean);
    }, [loading]);

    const hasErrors = useCallback(() => {
        return Object.values(error).some(err => err !== null);
    }, [error]);

    return ({
        // loadFolder,
        data,
        loading,
        isLoading,
        error,
        hasErrors,
        getItemById,
        loadRoot,
        loadFolderByPath,
        createFolder,
        renameFolder,
        deleteFolder,
        uploadFile,
        deleteFile,
        downloadFile,
        moveStorageItem,
        clearError,
    })
}