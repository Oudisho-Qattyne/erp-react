// src/modules/storage/presentation/components/StorageToolbar.tsx
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
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
    return (
        <div className="flex gap-2 p-2 border-b border-border bg-card">
            <Button variant="outline" size="sm" onClick={onAddFolder}>
                <FolderPlus size={16} className="ml-1" />
                مجلد جديد
            </Button>
            <Button variant="outline" size="sm" onClick={onUpload}>
                <Upload size={16} className="ml-1" />
                رفع ملف
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onDeleteSelected}
                disabled={!hasSelection}
                className="text-danger hover:text-danger"
            >
                <Trash2 size={16} className="ml-1" />
                حذف المحدد
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onRenameSelected}
                disabled={!hasRenameSelection}>
                <Repeat size={16} className="ml-1" />
                اعادة تسمية
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onMoveSelected}
                disabled={!hasSelection}>
                <Scissors size={16} className="ml-1" />
                قص
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onPaste}
                disabled={!hasCopiedItems}>
                <Clipboard size={16} className="ml-1" />
                لصق
            </Button>
        </div>
    );
}