// src/modules/storage/presentation/components/StorageToolbar.tsx
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { FolderPlus, Upload, Trash2, Repeat } from 'lucide-react';

interface StorageToolbarProps {
    onAddFolder: () => void;
    onUpload: () => void;
    onDeleteSelected: () => void;
    onRenameSelected: () => void
    hasSelection: boolean;
    hasRenameSelection: boolean;
}

export function StorageToolbar({ onAddFolder, onUpload, onDeleteSelected, onRenameSelected, hasSelection, hasRenameSelection }: StorageToolbarProps) {
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
        </div>
    );
}