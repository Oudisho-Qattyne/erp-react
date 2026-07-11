import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { LoadingState } from '../../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import type { DossierStatusHistory } from '../../../../domain/entities/dossierStatusHistory';

interface DossierStatusHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  histories?: DossierStatusHistory[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function DossierStatusHistoryModal({ isOpen, onClose, histories = [], loading, error, onRetry }: DossierStatusHistoryModalProps) {
  const { t } = useLanguage();

  const columns = [
    {
      key: 'status',
      label: t('dossier.status', 'investments') || 'Status',
      width: 120,
      render: (row: DossierStatusHistory) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            color: row.status === 'active' ? '#16a34a' : row.status === 'cancelled' ? '#dc2626' : row.status === 'allocatable' ? '#2563eb' : '#ca8a04',
            background: row.status === 'active' ? '#dcfce7' : row.status === 'cancelled' ? '#fef2f2' : row.status === 'allocatable' ? '#dbeafe' : '#fefce8',
          }}>
          {t(`dossier.status_${row.status}`, 'investments') || row.status}
        </span>
      )
    },
    {
      key: 'status_date',
      label: t('dossier.date', 'investments') || 'Dossier Date',
      width: 120,
      render: (row: DossierStatusHistory) => row.status_date ? new Date(row.status_date).toLocaleDateString() : '—'
    },
    {
      key: 'user',
      label: t('plots.changed_by', 'investments') || 'Changed By',
      width: 130,
      render: (row: DossierStatusHistory) => row.user?.name || '—'
    },
    {
      key: 'notes',
      label: t('plots.notes', 'investments') || 'Notes',
      width: 250,
      render: (row: DossierStatusHistory) => (
        <span className="text-sm whitespace-pre-wrap">{row.notes || '—'}</span>
      )
    },
    {
      key: 'created_at',
      label: t('plots.created_at', 'investments') || 'Created At',
      width: 150,
      render: (row: DossierStatusHistory) => row.created_at ? new Date(row.created_at).toLocaleString() : '—'
    }
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('dossier.status_history', 'investments') || 'Dossier Status History'}
      size="xl"
    >
      <div className="mt-4 min-h-25">
        {loading ? (
          <LoadingState message={t('common.loading', 'shared') || 'Loading...'} />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <DataTable
              columns={columns}
              data={[...histories].reverse()}
              rowKey="id"
              emptyMessage={t('dossier.no_history', 'investments') || 'No status history found'}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}
