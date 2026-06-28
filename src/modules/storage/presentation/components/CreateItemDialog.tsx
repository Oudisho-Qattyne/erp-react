import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { FileUploadForm } from './FileUploadForm';
import { FolderCreateForm } from './FolderCreateForm';

interface CreateItemDialogProps {
  isOpen: boolean;
  type: 'file' | 'folder' | null;
  parentId: string;
  file?: File;
  onClose: () => void;
  onCreateFolder: (parentId: string, name: string, api: any, clipPath?:string) => Promise<void>;
  onUploadFile: (parentId: string, file: File, isSecure: boolean, name: string, api: any, clipPath?:string) => Promise<void>;
  apiRef: React.MutableRefObject<any>;
  clipPath?:string
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
  clipPath
}: CreateItemDialogProps) {
  const { t } = useLanguage();
  const titleKey = type === 'folder' ? 'create_item_dialog.title_folder' : 'create_item_dialog.title_file';

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t(titleKey, 'storage')}>
      {type === 'folder' && (
        <FolderCreateForm
          parentId={parentId}
          onSuccess={async (name) => {
            await onCreateFolder(parentId, name, apiRef.current , clipPath);
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
            await onUploadFile(parentId, file, isSecure, name, apiRef.current,clipPath);
            onClose();
          }}
          onCancel={onClose}
        />
      )}
    </Dialog>
  );
}