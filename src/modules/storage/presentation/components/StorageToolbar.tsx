import { FolderPlus, Upload } from 'lucide-react';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';

interface StorageToolbarProps {
  onAddFolder: () => void;
  onUpload: () => void;
}

export function StorageToolbar({ onAddFolder, onUpload }: StorageToolbarProps) {
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
    </div>
  );
}