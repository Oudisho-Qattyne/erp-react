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

    // Split both paths, filter out empty strings, then join
    const segments = [...path1.split('/'), ...path2.split('/')];
    const filtered = segments.filter(seg => seg !== '');

    if (filtered.length === 0) return '/';
    return '/' + filtered.join('/');
}


const OP_KEYS = ["init", "getItemById", "loadRoot", "loadFolderByPath"] as const;

function initRecord<T>(value: T): Record<string, T> {
    return Object.fromEntries(OP_KEYS.map((k) => [k, value]));
}

export interface UseFileExplorerReturn {
    data: StorageItemDto[];
    loading: Record<string, boolean>;
    error: Record<string, string | null>;
    getItemById: (id: string) => Promise<DomainResponse<StorageItemDto>>;
    loadRoot: () => Promise<void>;
    // loadFolder: (folderId: string, apiRef: any ) => Promise<void>;
    loadFolderByPath: (path: string, api: any, clipPath?: string) => Promise<void>;
    createFolder: (parentId: string, name: string, api: any) => Promise<void>;
    uploadFile: (parentId: string, file: File, isSecure: boolean, name: string, api: any) => Promise<void>;
    deleteFolder: (parentId: string, id: string, api: any, clipPath?: string) => Promise<void>;
    deleteFile: (parentId: string, id: string, api: any, clipPath?: string) => Promise<void>;
    // renameFolder: (parentId: string,id: string, name: string,api: any) => Promise<void>;
    clearError: () => void;
}


export const useFileExplorer = (folderId?: string): UseFileExplorerReturn => {

    const [rootFolder, setRootFolder] = useState<StorageItemDto | null>(null)

    const apiClient = useApiClient();
    const { language } = useLanguage();
    const [data, setData] = useState<StorageItemDto[]>([]);
    const [loading, setLoading] = useState<Record<string, boolean>>(() => initRecord(false));
    const [error, setError] = useState<Record<string, string | null>>(() => initRecord(null));


    const repository = createManageStorageRepository(apiClient);
    const useCase = createManageStorageUseCase(repository);

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
        setError(null);
        try {
            console.log(rootFolder);

            if (rootFolder) {
                console.log("there is root folder ", rootFolder);

                const res = await useCase.getFolderContentsByPath(mergePaths(rootFolder.id, path));

                res.data.forEach(i => {
                    i.id = removeFirstSegmentIfMatches(i.id, rootFolder.id)
                })
                console.log("loadFolderByPath", res);
                // setData(res.data);
                api.exec("provide-data", { data: res.data, id: path });

            }
            else {
                console.log("no root", path);

                const res = await useCase.getFolderContentsByPath(path);
                // setData(res.data);
                api.exec("provide-data", { data: res.data, id: path });

            }
            // api.exec("provide-data", { data: res.data, id: path });
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

    const deleteFolder = useCallback(async (parent: string, id: string, api: any, clipPath?: string) => {
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
    const deleteFile = useCallback(async (parent: string, id: string, api: any, clipPath?: string) => {
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

    const loadRoot = useCallback(async (rootFolder?: StorageItemDto) => {
        setFunctionLoading("loadRoot", true)

        setFunctionError("getItemById", null);
        try {
            if (rootFolder) {
                const res = await useCase.getFolderContentsByPath(rootFolder.id);
                res.data.forEach(i => {
                    i.id = removeFirstSegmentIfMatches(i.id, rootFolder.id)
                })
                setData(res.data);
            }
            else {
                const res = await useCase.listRootLevel();
                setData(res.data);
            }
        }
        catch (err: any) {
            switch (err.status) {
                case 403:
                    setFunctionError("getItemById", "Forbiden");
                    break;
                default:
                    setFunctionError("getItemById", err.message || "Failed to load root items");
                    break;
            }

        } finally {
            setFunctionLoading("loadRoot", false)

        }
    }, [useCase, rootFolder, setRootFolder]);

    const init = useCallback(async () => {
        if (folderId) {
            setFunctionLoading("init", true)
            setFunctionError("init", null)
            try {
                const res = await getItemById(folderId)
                setRootFolder(res.data)
                await loadRoot(res.data)
            } catch (error) {
                setFunctionError("init", "Faild to load folder")
            }
            finally {
                setFunctionLoading("init", false)
            }
        }
    }, [folderId]
    )

    useEffect(() => {
        init()
    }, [])


    return ({
        data,
        loading,
        error,
        getItemById,
        loadRoot,
        // loadFolder,
        loadFolderByPath,
        createFolder,
        // renameFolder,
        uploadFile,
        deleteFolder,
        deleteFile,
        clearError,
    })
}