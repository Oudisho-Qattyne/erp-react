import { useCallback, useEffect, useRef, useState } from 'react';
import { Filemanager, Willow, type IApi, type IFileMenuOption, type IParsedEntity, type TContextMenuType } from '@svar-ui/react-filemanager';
import '@svar-ui/react-filemanager/all.css';
import { useManageStorage } from '../hooks/useManageStorage';
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

interface FileExplorerProps {
    folderId?: string;
    onSelectionChange?: (items: StorageItemDto[]) => void;
    hideToolbar?: boolean;
}

export function FileExplorer({ folderId, onSelectionChange, hideToolbar }: FileExplorerProps) {
    const {
        loadRoot,
        data,
        getItemById,
        loadFolderByPath,
        loadFolder,
        createFolder,
        uploadFile,
        deleteFile,
        deleteFolder,
        renameFolder,
        error,
        loading,
    } = useManageStorage();

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
    const apiRef = useRef<any>(null);
    const { language } = useLanguage();

    const loadRootPath = async () => {
        const res = await getItemById(folderId)
        if (res.data.type == 'folder') {
            let path = ''
            if (res.data.path == "/") {
                path = `${res.data.path}${res.data.name}`
            }
            else {
                path = `${res.data.path}/${res.data.name}`
            }
            setRootPath(path)
            return path
        }
    }
    useEffect(() => {
        const fetchContent = async () => {
            const path = await loadRootPath()
            loadFolder(folderId, apiRef.current, path);
        }
        if (!folderId) {
            loadRoot();
        } else if (apiReady) {
            fetchContent()
        }
    }, [folderId, apiReady]);

    // useEffect(() => {
    //     const fetchContent = async () => {
    //         const path = await loadRootPath()
    //         loadFolder(folderId, apiRef.current, path);
    //     }
    //     if (folderId && apiReady) {
    //         fetchContent()
    //     }
    // }, [folderId, apiReady]);

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

        return options;
    }, []);


    const init = useCallback(
        (api: IApi) => {
            apiRef.current = api;
            setApiReady(true);
            api.intercept('create-folder', async ({ parent }) => {
                console.log( "init create-folder: ", parent );
                
                setCreateDialog({ type: 'folder', parentId: parent });
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

            api.on('select-file', () => {
                const state = api.getState();
                const selectedSet = new Set();
                state?.panels?.forEach((panel: any) => {
                    if (panel._selected) {
                        panel._selected.forEach((item: any) => selectedSet.add(item));
                    }
                });
                const selected = Array.from(selectedSet) as any[];
                setSelectedItems(selected);
                onSelectionChange?.(selected);
            });

            api.on('set-path', async ({ id }: { id: string }) => {
                console.log("init set-path : " , id);
                
                setCurrentPath(id);
                await loadFolderByPath(id, api);
            });

            api.intercept('delete-files', async ({ ids }) => {
                return false;
            });
        },
        [loadFolderByPath, onSelectionChange]
    );

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
                    await deleteFolder(item.parent, item._id, apiRef, rootPath);
                } else {
                    await deleteFile(item.parent, item._id, apiRef, rootPath);
                }
            }

            setSelectedItems([]);
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleConfirmRename = async (name: string) => {
        if (!renameConfirm) return;
        try {
            await renameFolder(renameConfirm.parent, renameConfirm._id, name, apiRef, rootPath);
            setSelectedItems([]);
            setRenameConfirm(null);
        } catch (err) {
            console.error('rename failed:', err);
        }
    };

    const closeCreateDialog = async () => {
        setCreateDialog(null);
    };

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
                                    hasSelection={selectedItems.length > 0}
                                    hasRenameSelection={selectedItems.filter(i => i.type == "folder").length > 0}
                                />
                            )}
                            <div className="flex-1 min-h-0">
                                <Filemanager ref={apiRef} init={init} data={data} menuOptions={customMenuOptions} />
                            </div>
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
                                </div>
                            )}
                        </div>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
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
