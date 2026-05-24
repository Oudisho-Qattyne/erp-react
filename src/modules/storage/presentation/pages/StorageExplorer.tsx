import { useEffect, useState } from 'react';
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

export function StorageExplorer() {
    const apiClient = useApiClient();
    const [dataProvider, setDataProvider] = useState<CustomRestDataProvider | null>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [driveInfo, setDriveInfo] = useState<any>({});
    const { language } = useLanguage()

    useEffect(() => {
        if (!apiClient) return;
        const provider = new CustomRestDataProvider(apiClient);
        setDataProvider(provider);

        // Initial load
        Promise.all([provider.loadFiles(), provider.loadInfo()]).then(([fileList, info]) => {
            setFiles(fileList);
            setDriveInfo(info.stats || {});
        });
    }, [apiClient]);

    const init = (api: any) => {
        if (dataProvider) {
            api.setNext(dataProvider);
        }
    };

    if (!dataProvider) {
        return <div className="flex items-center justify-center h-64">جار التحميل...</div>;
    }

    return (
        <div className="storage-explorer-container" style={{ height: 'calc(100vh - 120px)' }}>
            <Willow>
                <Locale words={language == 'ar' ? ar : en} optional={true}>
                    <Filemanager init={init} data={files} drive={driveInfo} />
                </Locale>
            </Willow>
        </div>
    );
}