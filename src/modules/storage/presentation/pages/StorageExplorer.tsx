// src/modules/storage/presentation/pages/StorageExplorer.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Filemanager, getMenuOptions, Willow, type FilePreview, type IApi, type IFileMenuOption, type IParsedEntity, type TContextMenuType } from '@svar-ui/react-filemanager';
import '@svar-ui/react-filemanager/all.css';
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
import { FileExplorer } from '../components/FileExplorer';
import { useFileExplorer } from '../hooks/useFileExplorer';
import { Image } from '../components/Image';

export function StorageExplorer() {
    return (
        <div className="h-full">
          <FileExplorer />
        </div>
    );
}