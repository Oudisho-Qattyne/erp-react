import { useCallback, useEffect, useRef, useState } from 'react';
import { Filemanager, Willow, type IApi } from '@svar-ui/react-filemanager';
import '../styles/filemanager-theme.css';
import '../styles/storage-explorer.css';
import '@svar-ui/react-filemanager/all.css';
import { useManageStorage } from '../hooks/useManageStorage';
import { StorageToolbar } from '../components/StorageToolbar';
import { FileUploadForm } from '../components/FileUploadForm';
import { FolderCreateForm } from '../components/FolderCreateForm';
import { Locale } from '@svar-ui/react-core';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { ar } from '../locales/fileManagerComponentLocales/ar';
import { en } from '../locales/fileManagerComponentLocales/en';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';

export function StorageExplorer() {
  const { loadRoot, data, loadFolderByPath, createFolder, uploadFile, error, loading } = useManageStorage();
  const [customDialog, setCustomDialog] = useState<{
    type: 'file' | 'folder';
    parentId: string;
    file?: File;
  } | null>(null);
  const [currentPath, setCurrentPath] = useState('root');
  const apiRef = useRef<any>(null);
  const { language } = useLanguage();

  useEffect(() => {
    loadRoot();
  }, []);

  const init = useCallback((api: IApi) => {
    apiRef.current = api;
    api.on("set-path", async ({ id }: { id: string }) => {
      setCurrentPath(id);
      api.exec("provide-data", { data: null, id });
      await loadFolderByPath(id, api);
    });
  }, [loadFolderByPath]);

  const handleAddFolder = () => {
    setCustomDialog({ type: 'folder', parentId: currentPath });
  };

  const handleUpload = () => {
    // Trigger file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setCustomDialog({ type: 'file', parentId: currentPath, file });
      }
    };
    input.click();
  };

  return (
    <div className="storage-explorer-container h-full" style={{ height: 'calc(100vh - 120px)' }}>
      <Willow>
        <Locale words={language === 'ar' ? ar : en} optional={true}>
          <div className="relative h-full flex flex-col">
            {/* Custom toolbar */}
            <StorageToolbar onAddFolder={handleAddFolder} onUpload={handleUpload} />
            {/* Filemanager component (its own toolbar is hidden by CSS) */}
            <div className="flex-1">
              <Filemanager ref={apiRef} init={init} data={data} />
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

      {/* Custom Dialogs */}
      <Dialog isOpen={!!customDialog} onClose={() => setCustomDialog(null)} title={customDialog?.type === 'folder' ? 'إنشاء مجلد جديد' : 'رفع ملف'}>
        {customDialog?.type === 'folder' && (
          <FolderCreateForm
            parentId={customDialog.parentId}
            onSuccess={async (name) => {
              await createFolder(customDialog.parentId, name, apiRef.current);
              setCustomDialog(null);
            }}
            onCancel={() => setCustomDialog(null)}
          />
        )}
        {customDialog?.type === 'file' && customDialog.file && (
          <FileUploadForm
            parentId={customDialog.parentId}
            file={customDialog.file}
            onSuccess={async (isSecure) => {
              await uploadFile(customDialog.parentId, customDialog.file, isSecure, '', apiRef.current);
              setCustomDialog(null);
            }}
            onCancel={() => setCustomDialog(null)}
          />
        )}
      </Dialog>
    </div>
  );
}