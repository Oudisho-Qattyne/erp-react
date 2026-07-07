import { useEffect } from 'react';
import { Dialog } from '../dialog/Dialog';
import { DataTable } from '../tables/ResizableTable';
import { useAuditLogs } from '../../../hooks/data/auditLogs/useAuditLogs';
import type { AuditLog as AuditLogEntity } from '../../../../domain/entities/auditLog/auditLog';

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
}

interface AuditLogProps {
  isOpen: boolean;
  onClose: () => void;
  model: string;
  modelId?: number;
  labels?: AuditLogLabels;
  translateField?: (key: string) => string;
}

export function AuditLog({ isOpen, onClose, model, modelId, labels, translateField }: AuditLogProps) {
  const { auditLogs, loading, getAuditLogs } = useAuditLogs();

  useEffect(() => {
    if (isOpen) {
      getAuditLogs(model, modelId);
    }
  }, [isOpen, model, modelId]);

  const t = (key: keyof AuditLogLabels, fallback: string) => labels?.[key] || fallback;

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
      render: (row: AuditLogEntity) => row.created_at ? new Date(row.created_at).toLocaleString() : '—'
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
      title={t('title', 'Audit Log')}
      size="xl"
    >
      <div className="mt-4 ">
        {loading ? (
          <div className="flex justify-center p-8 text-sm text-text-muted">Loading...</div>
        ) : (
          <DataTable
            columns={columns}
            data={auditLogs}
            rowKey="id"
            emptyMessage={t('no_records', 'No audit logs found')}
          />
        )}
      </div>
    </Dialog>
  );
}
