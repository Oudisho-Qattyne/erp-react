import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
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
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="مستكشف الملفات" size="3xl">
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
