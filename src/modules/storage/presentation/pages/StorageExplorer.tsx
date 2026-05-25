import { useCallback, useEffect, useRef, useState } from 'react';
import { Filemanager, Willow } from '@svar-ui/react-filemanager';
import '@svar-ui/react-filemanager/all.css';
import { CustomRestDataProvider } from '../../infrastructure/providers/CustomRestDataProvider';
import { useApiClient } from '../../../../core/presentation/context/api/ApiClinetProvider';
import "@svar-ui/react-filemanager/all.css";
import { ar } from '../locales/fileManagerComponentLocales/ar'
import { en } from '../locales/fileManagerComponentLocales/en'
import { useLanguage } from "../../../../core/presentation/context/i18n/I18nProvider";
import { Locale } from '@svar-ui/react-core';
import "@svar-ui/react-filemanager/all.css";
import { useManageStorage } from '../hooks/useManageStorage';

export function StorageExplorer() {

    const { loadRoot, data,loadFolder, loadFolderByPath, error , loading} = useManageStorage()

    const apiRef = useRef(null);
    const { language } = useLanguage()

    useEffect(() => {
        loadRoot()
    }, [])

    const init = useCallback((api: any) => {
        // Listen to every path change (navigation, back, breadcrumb)
        api.on("set-path", async ({ id }: { id: string }) => {
            // Do not reload the root – it's already loaded via loadRoot()
            // if (!id || id === "/") return;

            // Optional: clear any cached data for this folder to force a fresh load
            api.exec("provide-data", { data: null, id });

            // Fetch fresh folder content (your loadFolderByPath should call api.exec("provide-data", ...))
            await loadFolderByPath(id, api);
        });
    }, [loadFolderByPath]);

    return (
        <div className="storage-explorer-container" style={{ height: 'calc(100vh - 120px)' }}>
            <Willow>
                <Locale words={language === 'ar' ? ar : en} optional={true}>
                    <div className="relative h-full">
                        <Filemanager ref={apiRef} init={init} data={data} />
                        {loading && (
                            <div className="absolute inset-0  flex items-center justify-center z-10">
                                <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </Locale>
            </Willow>
        </div>
    );
}