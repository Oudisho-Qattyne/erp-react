import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { FolderPlus, Upload, Trash2, Repeat, Scissors, BookMarked, Clipboard } from 'lucide-react';

interface StorageToolbarProps {
    onAddFolder: () => void;
    onUpload: () => void;
    onDeleteSelected: () => void;
    onRenameSelected: () => void
    onMoveSelected:() => void;
    hasSelection: boolean;
    hasRenameSelection: boolean;
    hasCopiedItems : boolean;
    onPaste : () => void
}

export function StorageToolbar({ onAddFolder, onUpload, onDeleteSelected, onRenameSelected, onMoveSelected , onPaste, hasSelection, hasRenameSelection, hasCopiedItems}: StorageToolbarProps) {
    const { t } = useLanguage();
    return (
        <div className="flex gap-2 p-2 border-b border-border bg-card">
            <Button variant="outline" size="sm" onClick={onAddFolder} requiredPermission="storage.folder.create">
                <FolderPlus size={16} className="ml-1" />
                {t('toolbar.add_folder', 'storage')}
            </Button>
            <Button variant="outline" size="sm" onClick={onUpload} requiredPermission="storage.file.upload">
                <Upload size={16} className="ml-1" />
                {t('toolbar.upload_file', 'storage')}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onDeleteSelected}
                disabled={!hasSelection}
                className="text-danger hover:text-danger"
                requiredPermission={['storage.folder.delete', 'storage.file.delete']}
            >
                <Trash2 size={16} className="ml-1" />
                {t('toolbar.delete_selected', 'storage')}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onRenameSelected}
                disabled={!hasRenameSelection}
                requiredPermission="storage.folder.rename">
                <Repeat size={16} className="ml-1" />
                {t('toolbar.rename', 'storage')}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onMoveSelected}
                disabled={!hasSelection}
                requiredPermission={['storage.folder.move', 'storage.file.move']}>
                <Scissors size={16} className="ml-1" />
                {t('toolbar.cut', 'storage')}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onPaste}
                disabled={!hasCopiedItems}
                requiredPermission={['storage.folder.move', 'storage.file.move']}>
                <Clipboard size={16} className="ml-1" />
                {t('toolbar.paste', 'storage')}
            </Button>
        </div>
    );
}