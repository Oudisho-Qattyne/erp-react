import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { FileExplorer } from './FileExplorer';
import type { StorageItemDto } from '../../application/dtos/storageItem';

interface FileExplorerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    folderId?: string;
    onSelectionChange?: (items: StorageItemDto[]) => void;
    fileTypes?: string[];
}

export function FileExplorerDialog({ isOpen, onClose, folderId, onSelectionChange, fileTypes }: FileExplorerDialogProps) {
    const { t } = useLanguage();
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={t('file_explorer_dialog.title', 'storage')} size="3xl">
            <div className="h-[70vh] flex flex-col -m-4">
                <div className="flex-1 min-h-0">
                    <FileExplorer
                        folderId={folderId}
                        onSelectionChange={onSelectionChange}
                        fileTypes={fileTypes}
                    />
                </div>
            </div>
        </Dialog>
    );
}
