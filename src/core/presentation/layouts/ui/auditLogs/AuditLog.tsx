import { useCallback, useEffect, useState } from 'react';
import { Dialog } from '../dialog/Dialog';
import { DataTable } from '../tables/ResizableTable';
import { ErrorState } from '../state/ErrorState';
import { useAuditLogs } from '../../../hooks/data/auditLogs/useAuditLogs';
import { useLanguage } from '../../../context/i18n/I18nProvider';
import type { AuditLog as AuditLogEntity } from '../../../../domain/entities/auditLog/auditLog';
import { LoadingState } from '../state/LoadingState';

interface AuditLogLabels {
  title?: string;
  event?: string;
  created_at?: string;
  changed_by?: string;
  changes?: string;
  field?: string;
  old_value?: string;
  new_value?: string;
  no_records?: string;
  subject_id?: string;
  error?: string;
  loading?: string;
}

interface AuditLogProps {
  isOpen: boolean;
  onClose: () => void;
  model: string;
  modelId?: number | number[];
  module?: string;
  labels?: AuditLogLabels;
  translateField?: (key: string) => string;
  translateValues?: (fieldKey: string, value: string) => string;
}

export function AuditLog({ isOpen, onClose, model, modelId, module = 'shared', labels, translateField, translateValues }: AuditLogProps) {
  const { auditLogs, loading, error, pagination, getAuditLogs } = useAuditLogs();
  const { t: langT } = useLanguage();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      getAuditLogs(model, modelId, 1, perPage);
    }
  }, [isOpen, model, modelId]);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    getAuditLogs(model, modelId, p, perPage);
  }, [model, modelId, perPage, getAuditLogs]);

  const handlePerPageChange = useCallback((size: number) => {
    setPerPage(size);
    setPage(1);
    getAuditLogs(model, modelId, 1, size);
  }, [model, modelId, getAuditLogs]);

  const t = (key: keyof AuditLogLabels, fallback: string) => labels?.[key] || langT(key, module) || fallback;

  const columns = [
    ...(!modelId ? [{
      key: 'subject_id',
      label: t('subject_id', 'ID'),
      width: 80,
      render: (row: AuditLogEntity) => row.subject_id || '—'
    }] : []),
    {
      key: 'description',
      label: t('event', 'Event'),
      width: 100,
      render: (row: AuditLogEntity) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-dark bg-primary-light/20 px-2 py-0.5 rounded-full capitalize">
          {row.description}
        </span>
      )
    },
    {
      key: 'created_at',
      label: t('created_at', 'Created At'),
      width: 150,
      render: (row: AuditLogEntity) => row.created_at || '—'
    },
    {
      key: 'causer',
      label: t('changed_by', 'Changed By'),
      width: 130,
      render: (row: AuditLogEntity) => row.causer?.name || '—'
    },
    {
      key: 'changes',
      label: t('changes', 'Changes'),
      width: 300,
      render: (row: AuditLogEntity) => {
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
                  <th className="px-2 py-1.5 border-b border-border font-semibold text-text">{t('field', 'Field')}</th>
                  {hasOld && <th className="px-2 py-1.5 border-b border-l border-border font-semibold text-danger">{t('old_value', 'Old Value')}</th>}
                  {hasNew && <th className="px-2 py-1.5 border-b border-l border-border font-semibold text-success">{t('new_value', 'New Value')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allKeys.map(k => (
                  <tr key={k} className="hover:bg-surface/50">
                    <td className="px-2 py-1.5 font-medium text-text-muted break-all max-w-25">{translateField ? translateField(k) : k}</td>
                    {hasOld && (
                      <td className="px-2 py-1.5 border-l border-border text-danger/80 break-all max-w-37.5">
                        {oldProps[k] !== undefined && oldProps[k] !== null ? (translateValues?.(k, String(oldProps[k])) || String(oldProps[k])) : '—'}
                      </td>
                    )}
                    {hasNew && (
                      <td className="px-2 py-1.5 border-l border-border text-success/90 break-all max-w-37.5">
                        {newProps[k] !== undefined && newProps[k] !== null ? (translateValues?.(k, String(newProps[k])) || String(newProps[k])) : '—'}
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
      title={t('title', 'Audit Log')}
      size="2xl"
    >
      <div className="mt-4 ">
        {loading ? (
          <LoadingState message={langT('common.loading', 'shared') || 'Loading...'} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => getAuditLogs(model, modelId)} />
        ) : (
          <DataTable
            columns={columns}
            data={auditLogs}
            rowKey="id"
            emptyMessage={t('no_records', 'No audit logs found')}
            pagination={pagination ? {
              page,
              totalPages: pagination.lastPage,
              totalItems: pagination.total,
              onPageChange: handlePageChange,
              itemsPerPage: perPage,
              onItemsPerPageChange: handlePerPageChange,
            } : undefined}
          />
        )}
      </div>
    </Dialog>
  );
}
