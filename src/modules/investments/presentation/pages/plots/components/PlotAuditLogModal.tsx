import React, { useEffect, useState } from 'react';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { useApiClient } from '../../../../../../core/presentation/context/api/ApiClinetProvider';
import {type DomainResponse } from '../../../../../../core/domain/common/responce/DomainResponse';

interface AuditLog {
  id: number;
  description: string;
  created_at: string;
  causer?: { name: string };
  subject_id?: number;
  properties?: {
    old?: Record<string, any>;
    attributes?: Record<string, any>;
  };
}

interface PlotAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  plotId?: number;
}

export function PlotAuditLogModal({ isOpen, onClose, plotId }: PlotAuditLogModalProps) {
  const { t } = useLanguage();
  const apiClient = useApiClient();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchLogs = async () => {
        setLoading(true);
        try {
          const modelName = 'plot';
          const url = plotId 
            ? `/shared-kernal/audit-logs?model=${modelName}&model_id=${plotId}`
            : `/shared-kernal/audit-logs?model=${modelName}`;
          const response = await apiClient.get<DomainResponse<any>>(url);
          if (response && Array.isArray(response.data)) {
            setLogs(response.data);
          } else {
            setLogs([]);
          }
        } catch (error) {
          console.error("Failed to fetch audit logs", error);
        } finally {
          setLoading(false);
        }
      };
      fetchLogs();
    } else {
      setLogs([]);
    }
  }, [isOpen, plotId, apiClient]);

  const columns = [
    ...(!plotId ? [{
      key: 'subject_id',
      label: t('plots.plot_id', 'investments') || 'Plot ID',
      width: 80,
      render: (row: AuditLog) => row.subject_id || '—'
    }] : []),
    {
      key: 'description',
      label: t('plots.event', 'investments') || 'Event',
      width: 100,
      render: (row: AuditLog) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-dark bg-primary-light/20 px-2 py-0.5 rounded-full capitalize">
          {row.description}
        </span>
      )
    },
    {
      key: 'created_at',
      label: t('plots.created_at', 'investments') || 'Created At',
      width: 150,
      render: (row: AuditLog) => row.created_at ? new Date(row.created_at).toLocaleString() : '—'
    },
    {
      key: 'causer',
      label: t('plots.changed_by', 'investments') || 'Changed By',
      width: 130,
      render: (row: AuditLog) => row.causer?.name || '—'
    },
    {
      key: 'changes',
      label: t('plots.changes', 'investments') || 'Changes',
      width: 300,
      render: (row: AuditLog) => {
        if (!row.properties || Object.keys(row.properties).length === 0) return <span className="text-sm text-text-muted">—</span>;
        
        const oldProps = row.properties.old || {};
        const newProps = row.properties.attributes || {};
        const allKeys = Array.from(new Set([...Object.keys(oldProps), ...Object.keys(newProps)])).filter(k => k !== 'updated_at');
        
        if (allKeys.length === 0) return <span className="text-sm text-text-muted">—</span>;

        const hasOld = Object.keys(oldProps).length > 0;
        const hasNew = Object.keys(newProps).length > 0;

        return (
          <div className="w-full overflow-x-auto rounded border border-border">
            <table className="min-w-full text-xs text-left border-collapse">
              <thead className="bg-primary/5">
                <tr>
                  <th className="px-2 py-1.5 border-b border-border font-semibold text-text">{t('plots.field', 'investments') || 'Field'}</th>
                  {hasOld && <th className="px-2 py-1.5 border-b border-l border-border font-semibold text-danger">{t('plots.old_value', 'investments') || 'Old Value'}</th>}
                  {hasNew && <th className="px-2 py-1.5 border-b border-l border-border font-semibold text-success">{t('plots.new_value', 'investments') || 'New Value'}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allKeys.map(k => (
                  <tr key={k} className="hover:bg-surface/50">
                    <td className="px-2 py-1.5 font-medium text-text-muted break-all max-w-25">{t(`plots.${k}`, 'investments') || k}</td>
                    {hasOld && (
                      <td className="px-2 py-1.5 border-l border-border text-danger/80 break-all max-w-37.5">
                        {oldProps[k] !== undefined && oldProps[k] !== null ? String(oldProps[k]) : '—'}
                      </td>
                    )}
                    {hasNew && (
                      <td className="px-2 py-1.5 border-l border-border text-success/90 break-all max-w-37.5">
                        {newProps[k] !== undefined && newProps[k] !== null ? String(newProps[k]) : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }
  ];

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={t('plots.edit_log', 'investments') || 'Edit Log'}
      size="xl"
    >
      <div className="mt-4 max-h-[60vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-8 text-sm text-text-muted">Loading...</div>
        ) : (
          <DataTable
            columns={columns}
            data={logs}
            rowKey="id"
            emptyMessage={t('plots.no_edit_log', 'investments') || 'No edit logs found'}
          />
        )}
      </div>
    </Dialog>
  );
}
