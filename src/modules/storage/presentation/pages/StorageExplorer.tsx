// src/modules/storage/presentation/pages/StorageExplorer.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Filemanager, getMenuOptions, Willow, type FilePreview, type IApi, type IFileMenuOption, type IParsedEntity, type TContextMenuType } from '@svar-ui/react-filemanager';
import '@svar-ui/react-filemanager/all.css';
import { useManageStorage } from '../hooks/useManageStorage';
import { StorageToolbar } from '../components/StorageToolbar';
import { Locale } from '@svar-ui/react-core';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { ar } from '../locales/fileManagerComponentLocales/ar';
import { en } from '../locales/fileManagerComponentLocales/en';
import { CreateItemDialog } from '../components/CreateItemDialog';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import '../styles/filemanager-theme.css';
import '../styles/storage-explorer.css';
import { RenameItemDialog } from '../components/RenameItemDialog';
import type { StorageItem } from '../../domain/entities/FileSystemEntry';
import type { StorageItemDto } from '../../application/dtos/storageItem';

export function StorageExplorer() {
    const {
        loadRoot,
        data,
        loadFolderByPath,
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

    const [renameConfirm, setRenameConfirm] = useState<StorageItemDto | null>()

    const [selectedItems, setSelectedItems] = useState<StorageItemDto[]>([]);
    const [currentPath, setCurrentPath] = useState('root');
    const apiRef = useRef<any>(null);
    const { language } = useLanguage();

    // Initial load of root contents
    useEffect(() => {
        loadRoot();
    }, []);
    const customMenuOptions = useCallback((
        mode: TContextMenuType,
        item?: IParsedEntity
      ): IFileMenuOption[] => {
        // Only customise context menus for files and folders
        if (mode !== 'file' && mode !== 'folder') return [];
      
        const options: IFileMenuOption[] = [];
      
        // Rename option – only for folders (if files cannot be renamed)
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
      
        // Delete option – works for both files and folders
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
      }, []); // dependencies are stable (setRenameConfirm, setDeleteConfirm)
      function previewURL(file : FilePreview, width : number , height:number) {
        console.log(file , width , height);
        
        return ""
      }
    // File manager initialisation
    const init = useCallback(
        (api: IApi) => {
            apiRef.current = api;

            // Intercept folder creation – show custom dialog
            api.intercept('create-folder', async ({ parent }) => {
                setCreateDialog({ type: 'folder', parentId: parent });
                return false;
            });

            // Intercept file upload – show custom dialog
            api.intercept('create-file', async ({ parent, file }) => {
                setCreateDialog({
                    type: 'file',
                    parentId: parent,
                    file: file.file,
                });
                return false;
            });

            // Track selected items
            api.on('select-file', () => {
                const state = api.getState();
                const selectedSet = new Set();
                state.panels.forEach((panel: any) => {
                    if (panel._selected) {
                        panel._selected.forEach((item: any) => selectedSet.add(item));
                    }
                });
                const selected = Array.from(selectedSet) as any[];

                setSelectedItems(selected);
            });

            // Handle folder navigation
            api.on('set-path', async ({ id }: { id: string }) => {
                setCurrentPath(id);
                api.exec('provide-data', { data: null, id });
                await loadFolderByPath(id, api);
            });
            api.intercept('delete-files', async ({ ids }) => {
                return false; // block default dialog for keyboard delete as well
              });
        },
        [loadFolderByPath]
    );

    // Custom toolbar actions
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
        const folders = selectedItems.filter(f => f.type == "folder")
        if (folders.length === 0) return;
        setRenameConfirm(folders.pop())
    }

    const handleConfirmDelete = async () => {
        if (!deleteConfirm) return;
        const { items } = deleteConfirm;
        try {
            for (const item of items) {
                console.log(item.type);
                if (item.type == 'folder') {
                    await deleteFolder(item._id);
                }
                else {
                    await deleteFile(item._id);
                }
            }
            // Refresh the parent folder after deletion
            if (apiRef.current) {
                const parentId = items[0]?.parent;
                apiRef.current.exec('provide-data', { data: null, id: parentId });
                await loadFolderByPath(parentId, apiRef.current);
            }
            setSelectedItems([]);
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
        }
    };

    const handleConfirmRename = async (name: string) => {
        if (!renameConfirm) return;
        try {
            await renameFolder(renameConfirm._id, name)
            if (apiRef.current) {
                const parentId = renameConfirm.parent;
                apiRef.current.exec('provide-data', { data: null, id: parentId });
                await loadFolderByPath(parentId, apiRef.current);
            }
            setSelectedItems([]);
            setRenameConfirm(null);
        } catch (err) {
            console.error('rename failed:', err);

        }
    }
    const closeCreateDialog = async () => {
        setCreateDialog(null);

    };

    return (
        <div className="h-full">
            <div className="wx-willow-theme">
                <Willow>
                    <Locale words={language === 'ar' ? ar : en} optional={true}>
                        <div className="relative h-full flex flex-col">
                            <StorageToolbar
                                onAddFolder={handleAddFolder}
                                onUpload={handleUpload}
                                onDeleteSelected={handleDeleteSelected}
                                onRenameSelected={handleRenameSelected}
                                hasSelection={selectedItems.length > 0}
                                hasRenameSelection={selectedItems.filter(i => i.type == "folder").length > 0}
                            />
                            <Filemanager ref={apiRef} init={init} data={data} menuOptions={customMenuOptions} previews={previewURL}/>
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

            {/* Create/Upload Dialog */}
            <CreateItemDialog
                isOpen={!!createDialog}
                type={createDialog?.type || null}
                parentId={createDialog?.parentId || ''}
                file={createDialog?.file}
                onClose={closeCreateDialog}
                onCreateFolder={createFolder}
                onUploadFile={uploadFile}
                apiRef={apiRef}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={!!deleteConfirm}
                items={deleteConfirm?.items || []}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteConfirm(null)}
            />

            <RenameItemDialog
                isOpen={!!renameConfirm}
                item={renameConfirm}
                onCancel={() => setRenameConfirm(null)}
                onConfirm={handleConfirmRename}
            />
        </div>
    );
}