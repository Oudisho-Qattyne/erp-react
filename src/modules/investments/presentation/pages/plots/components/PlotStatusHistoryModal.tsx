import { useCallback, useEffect, useState } from 'react';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { LoadingState } from '../../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import type { PlotStatusHistory } from '../../../../domain/entities/plotStatusHistory';

interface PlotStatusHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  plotId: number;
}

export function PlotStatusHistoryModal({ isOpen, onClose, plotId }: PlotStatusHistoryModalProps) {
  const { t } = useLanguage();

  const { getAll: getHistory } = useEntityCrud<PlotStatusHistory>(
    `/investments/plots/${plotId}/status-history`,
    `/investments/plots/${plotId}/status-history`
  );

  const [histories, setHistories] = useState<PlotStatusHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const fetchHistory = useCallback(async (targetPage: number, targetPerPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHistory(undefined, { page: targetPage, perPage: targetPerPage });
      if (res?.data) setHistories(res.data);
      else setHistories([]);
      if (res?.lastPage != null) setTotalPages(res.lastPage);
      else setTotalPages(0);
    } catch {
      setHistories([]);
      setError(t('dossier.load_error', 'investments') || 'Failed to load status history');
    } finally {
      setLoading(false);
    }
  }, [getHistory, t]);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchHistory(1, perPage);
    }
  }, [isOpen]);

  const handlePageChange = useCallback((p: number) => {
    setPage(p);
    fetchHistory(p, perPage);
  }, [perPage, fetchHistory]);

  const handlePerPageChange = useCallback((size: number) => {
    setPerPage(size);
    setPage(1);
    fetchHistory(1, size);
  }, [fetchHistory]);

  const columns = [
    {
      key: 'status',
      label: t('plots.status', 'investments') || 'Status',
      width: 120,
      render: (row: PlotStatusHistory) => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-dark bg-primary-light/20 px-2 py-0.5 rounded-full">
          {t(`plot_status.${row.status}`, 'investments') || row.status}
        </span>
      )
    },
    {
      key: 'status_date',
      label: t('plots.status_date', 'investments') || 'Status Date',
      width: 120,
      render: (row: PlotStatusHistory) => row.status_date || '—'
    },
    {
      key: 'user',
      label: t('plots.changed_by', 'investments') || 'Changed By',
      width: 130,
      render: (row: PlotStatusHistory) => row.user?.name || '—'
    },
    {
      key: 'notes',
      label: t('plots.notes', 'investments') || 'Notes',
      width: 250,
      render: (row: PlotStatusHistory) => (
        <span className="text-sm whitespace-pre-wrap">{row.notes || '—'}</span>
      )
    },
    {
      key: 'created_at',
      label: t('plots.created_at', 'investments') || 'Created At',
      width: 150,
      render: (row: PlotStatusHistory) => row.created_at || '—'
    }
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('plots.status_history', 'investments') || 'Status History'}
      size="xl"
    >
      <div className="mt-4 min-h-25">
        {loading ? (
          <LoadingState message={t('common.loading', 'shared') || 'Loading...'} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchHistory(page, perPage)} />
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <DataTable
              columns={columns}
              data={[...histories].reverse()}
              rowKey="id"
              emptyMessage={t('plots.no_history', 'investments') || 'No status history found'}
              pagination={totalPages > 0 ? {
                page,
                totalPages,
                totalItems: totalPages,
                onPageChange: handlePageChange,
                itemsPerPage: perPage,
                onItemsPerPageChange: handlePerPageChange,
              } : undefined}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}
