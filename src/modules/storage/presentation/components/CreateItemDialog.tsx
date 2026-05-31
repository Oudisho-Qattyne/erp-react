// src/modules/storage/presentation/components/CreateItemDialog.tsx
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { FileUploadForm } from './FileUploadForm';
import { FolderCreateForm } from './FolderCreateForm';

interface CreateItemDialogProps {
  isOpen: boolean;
  type: 'file' | 'folder' | null;
  parentId: string;
  file?: File;
  onClose: () => void;
  onCreateFolder: (parentId: string, name: string, api: any) => Promise<void>;
  onUploadFile: (parentId: string, file: File, isSecure: boolean, name: string, api: any) => Promise<void>;
  apiRef: React.MutableRefObject<any>;
}

export function CreateItemDialog({
  isOpen,
  type,
  parentId,
  file,
  onClose,
  onCreateFolder,
  onUploadFile,
  apiRef,
}: CreateItemDialogProps) {
  const title = type === 'folder' ? 'إنشاء مجلد جديد' : 'رفع ملف';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      {type === 'folder' && (
        <FolderCreateForm
          parentId={parentId}
          onSuccess={async (name) => {
            await onCreateFolder(parentId, name, apiRef.current);
            onClose();
          }}
          onCancel={onClose}
        />
      )}
      {type === 'file' && file && (
        <FileUploadForm
          parentId={parentId}
          file={file}
          onSuccess={async (isSecure, name) => {
            await onUploadFile(parentId, file, isSecure, name, apiRef.current);
            onClose();
          }}
          onCancel={onClose}
        />
      )}
    </Dialog>
  );
}