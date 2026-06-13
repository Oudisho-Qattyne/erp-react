import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { Filemanager, Willow, type FilePreview, type IApi, type IFileMenuOption, type IParsedEntity, type TContextMenuType } from '@svar-ui/react-filemanager';
import '@svar-ui/react-filemanager/all.css';
import { StorageToolbar } from '../components/StorageToolbar';
import { Locale } from '@svar-ui/react-core';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { ar } from '../locales/fileManagerComponentLocales/ar';
import { en } from '../locales/fileManagerComponentLocales/en';
import { CreateItemDialog } from '../components/CreateItemDialog';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { RenameItemDialog } from '../components/RenameItemDialog';
import '../styles/filemanager-theme.css';
import '../styles/storage-explorer.css';
import type { StorageItemDto } from '../../application/dtos/storageItem';
import { useFileExplorer } from '../hooks/useFileExplorer';
import { useApiClient } from '../../../../core/presentation/context/api/ApiClinetProvider';
import type { StorageItem } from '../../domain/entities/FileSystemEntry';

interface FileExplorerProps {
    folderId?: string;
    multiple?: boolean;

    onSelectionChange?: (items: StorageItemDto[]) => void;
    hideToolbar?: boolean;
    fileTypes?: string[]
}

export function FileExplorer({ folderId, onSelectionChange, hideToolbar, fileTypes, multiple = true }: FileExplorerProps) {

    const apiClient = useApiClient();
    const previewCache = useRef<Map<string, string>>(new Map());
    const [, forceRender] = useReducer(x => x + 1, 0);

    const {
        // loadRoot,
        data,
        loading,
        isLoading,
        error,
        hasErrors,
        createFolder,
        deleteFolder,
        renameFolder,
        uploadFile,
        deleteFile,
        downloadFile,
        loadFolderByPath,
        moveStorageItem,
    } = useFileExplorer(folderId, fileTypes, previewCache)

    const [createDialog, setCreateDialog] = useState<{
        type: 'file' | 'folder';
        parentId: string;
        file?: File;
    } | null>(null);

    const [deleteConfirm, setDeleteConfirm] = useState<{
        items: StorageItemDto[];
    } | null>(null);

    const [renameConfirm, setRenameConfirm] = useState<StorageItemDto | null>();

    const [selectedItems, setSelectedItems] = useState<StorageItemDto[]>([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [apiReady, setApiReady] = useState(false);
    const [rootPath, setRootPath] = useState<string>("")
    const [copidItems, setCopiedItems] = useState<StorageItemDto[]>([])
    const apiRef = useRef<any>(null);
    const { language } = useLanguage();



    const init = useCallback(
        (api: IApi) => {
            apiRef.current = api;
            setApiReady(true);
            api.intercept('create-folder', async ({ parent }) => {
                setCreateDialog({ type: 'folder', parentId: parent });
                return false;
            });
            api.intercept('copy-files', async ({ parent }) => {
                return false;
            });
            api.intercept('move-files', async ({ parent }) => {
                return false;
            });

            api.intercept('create-file', async ({ parent, file }) => {
                setCreateDialog({
                    type: 'file',
                    parentId: parent,
                    file: file.file,
                });
                return false;
            });

            api.on('select-file', ({ id }) => {
                const state = api.getState();
                if (multiple) {
                    const selectedSet = new Set();
                    state?.panels?.forEach((panel: any) => {
                        if (panel._selected) {
                            panel._selected.forEach((item: any) => {
                                if (fileTypes && fileTypes.length > 0) {
                                    if (item.type == "file") {
                                        const fileType = item?.mime_type?.split('/')[0]
                                        if (fileType) {
                                            if (fileTypes.includes(fileType)) {
                                                selectedSet.add(item)
                                            }

                                        }
                                    }
                                }
                                else {
                                    selectedSet.add(item)
                                }
                            });
                        }
                    });
                    const selected = Array.from(selectedSet) as any[];
                    setSelectedItems(selected);
                    onSelectionChange?.(selected);
                }
                else {
                    if (id) {
                        const storageItem = api.getFile(id)
                        if (storageItem) {
                            if (fileTypes && fileTypes.length > 0) {
                                if (storageItem.type == "file") {
                                    const fileType = storageItem?.mime_type?.split('/')[0]
                                    if (fileType) {
                                        if (fileTypes.includes(fileType)) {
                                            setSelectedItems([storageItem]);
                                            onSelectionChange?.([storageItem])
                                        } else {
                                            setSelectedItems([]);
                                            onSelectionChange?.([])
                                        }
                                    }
                                } else {
                                    setSelectedItems([]);
                                    onSelectionChange?.([])
                                }
                            }
                            else {
                                setSelectedItems([storageItem]);
                                onSelectionChange?.([storageItem])
                            }
                        }
                    }
                }
            });

            api.intercept('delete-files', async ({ ids }) => {
                return false;
            });
        },
        [onSelectionChange]
    );

    useEffect(() => {
        const api = apiRef.current;
        if (!api) return;

        const tag = 'set-path-handler';
        api.detach(tag);
        api.on('set-path', async ({ id }: { id: string }) => {
            setCurrentPath(id);
            await loadFolderByPath(id, api);
        }, { tag });
    }, [loadFolderByPath]);

    const handleAddFolder = () => {
        setCreateDialog({ type: 'folder', parentId: currentPath });
    };

    const handleUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                setCreateDialog({ type: 'file', parentId: currentPath, file });
            }
        };
        input.click();
    };

    const handleDeleteSelected = () => {
        if (selectedItems.length === 0) return;
        setDeleteConfirm({ items: selectedItems });
    };

    const handleRenameSelected = () => {
        const folders = selectedItems.filter(f => f.type == "folder");
        if (folders.length === 0) return;
        setRenameConfirm(folders.pop());
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirm) return;
        const { items } = deleteConfirm;
        try {
            for (const item of items) {
                if (item.type == 'folder') {
                    await deleteFolder(item.parent, item.id, apiRef.current);
                } else {
                    await deleteFile(item.parent, item.id, apiRef.current);
                }
            }

            setSelectedItems([]);
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };
console.log(selectedItems);

    const handleMoveSelected = () => {
        console.log(selectedItems);
        
        console.log("handleMoveSelected");
        
        setCopiedItems(selectedItems)
    }

    const handleConfirmRename = async (name: string) => {
        if (!renameConfirm) return;
        try {
            await renameFolder(renameConfirm.parent, renameConfirm.id, name, apiRef.current);
            setSelectedItems([]);
            setRenameConfirm(null);
        } catch (err) {
            console.error('rename failed:', err);
        }
    };

    const closeCreateDialog = async () => {
        setCreateDialog(null);
    };

    const previews = (file: FilePreview, width: number, height: number): string | null => {
        if (file.type !== 'file') return null;
        const mimeType = (file as any).mime_type;
        if (!mimeType?.startsWith('image')) return null;
        const cached = previewCache.current.get(file.id);
        if (cached) return cached;
        apiClient.get<Blob>(`/storage-management/${file._id || file.id}`, { responseType: 'blob' })
            .then(blob => {
                const url = URL.createObjectURL(blob);
                previewCache.current.set(file.id, url);
                forceRender();
            })
            .catch(() => { });
        return null;
    }

    const onPaste = async () => {
        console.log("onPaste");

        await copidItems.forEach(async ci => {
            try {
                const res = await moveStorageItem(ci.id, currentPath, apiRef.current)

            } catch (error) {
                console.log(error);

            }
        })
        setCopiedItems([])

    }


    const customMenuOptions = useCallback((
        mode: TContextMenuType,
        item?: IParsedEntity
    ): IFileMenuOption[] => {
        if (mode !== 'file' && mode !== 'folder') return [];

        const options: IFileMenuOption[] = [];

        if (mode === 'folder') {
            options.push({
                id: 'rename-custom',
                text: 'إعادة تسمية',
                hotkey: 'F2',
                handler: () => {
                    if (item && item._id) {
                        setRenameConfirm(item);
                    }
                },
            });
        }

        options.push({
            id: 'delete-custom',
            text: 'حذف',
            hotkey: 'Shift+Delete',
            handler: () => {
                if (item && item._id) {
                    const deleteItems: StorageItemDto[] = [item];
                    setDeleteConfirm({ items: deleteItems });
                }
            },
        });
        if (mode === 'file') {
            options.push({
                id: "custom-download",
                text: "تحميل",
                hotkey: 'd',
                handler: async () => {
                    if (item && item._id) {
                        await downloadFile(item.id, "", apiRef.current)
                    }
                }
                
            })
            
        }
            options.push({
                id: "custom-cut",
                text: "قص",
                hotkey: '',
                handler: async () => {
                    handleMoveSelected()
                }
            })
            options.push({
                id: "custom-paste",
                text: "لصق",
                hotkey: '',
                handler: async () => {
                    onPaste()
                }
            })
            

        return options;
    }, [selectedItems , onPaste , handleMoveSelected , copidItems]);
    return (
        <div className="h-full relative">
            <div className="wx-willow-theme">
                <Willow>
                    <Locale words={language === 'ar' ? ar : en} optional={true}>
                        <div className="relative h-full flex flex-col">
                            {!hideToolbar && (
                                <StorageToolbar
                                    onAddFolder={handleAddFolder}
                                    onUpload={handleUpload}
                                    onDeleteSelected={handleDeleteSelected}
                                    onRenameSelected={handleRenameSelected}
                                    onMoveSelected={handleMoveSelected}
                                    hasCopiedItems={copidItems.length > 0}
                                    onPaste={onPaste}
                                    hasSelection={selectedItems.length > 0}
                                    hasRenameSelection={selectedItems.filter(i => i.type == "folder").length > 0}
                                />
                            )}
                            <div className="flex-1 min-h-0">
                                <Filemanager ref={apiRef} init={init} data={data} menuOptions={customMenuOptions} previews={previews} />
                            </div>
                            {isLoading() && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
                                </div>
                            )}
                        </div>
                        {hasErrors() && <p className="text-red-500 mt-2">somthing went wrong</p>}
                    </Locale>
                </Willow>
            </div>

            <CreateItemDialog
                isOpen={!!createDialog}
                type={createDialog?.type || null}
                parentId={createDialog?.parentId || ''}
                file={createDialog?.file}
                onClose={closeCreateDialog}
                onCreateFolder={createFolder}
                onUploadFile={uploadFile}
                apiRef={apiRef}
                clipPath={rootPath}
            />

            <DeleteConfirmDialog
                isOpen={!!deleteConfirm}
                items={deleteConfirm?.items || []}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteConfirm(null)}
            />

            <RenameItemDialog
                isOpen={!!renameConfirm}
                item={renameConfirm ? renameConfirm : null}
                onCancel={() => setRenameConfirm(null)}
                onConfirm={handleConfirmRename}
            />
        </div>
    );
}
