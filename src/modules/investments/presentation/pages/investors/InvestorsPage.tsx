import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Investor } from '../../../domain/entities/investor';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import Input from '../../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { ConfirmDialog } from '../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { toast } from 'sonner';
import { Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function InvestorsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { entities: investors, getAll, remove, loading, error, pagination } = useEntityCrud<Investor>('/investments/investors', '/investments/investors');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Investor | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Table State
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  // Fetch Data (Server Side)
  useEffect(() => { 
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    
    if (sortColumn) {
      params.append('sortColumn', sortColumn);
      params.append('sortOrder', sortOrder);
    }
    
    params.append('page', String(page));
    
    getAll(`/investments/investors?${params.toString()}`);
  }, [searchQuery, sortColumn, sortOrder, page]);

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(key);
      setSortOrder('asc');
    }
    setPage(1); // Reset page on sort
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setConfirmLoading(true);
    try {
      await remove(confirmDelete.id);
      toast.success(t('investors.deleted', 'investments') || 'Investor deleted');
      setPage(prev => prev);
    } catch {
      toast.error(t('investors.delete_error', 'investments') || 'Failed to delete investor');
    }
    setConfirmDelete(null);
    setConfirmLoading(false);
  };

  const columns = [
    { 
      key: 'full_name', 
      label: t('investors.full_name', 'investments') || 'Full Name', 
      width: 200,
      sortable: true,
      render: (row: Investor) => <span className="font-medium">{row.full_name}</span>
    },
    { 
      key: 'national_id', 
      label: t('investors.national_id', 'investments') || 'National ID', 
      width: 150,
      sortable: true,
      render: (row: Investor) => row.national_id || '—'
    },
    { 
      key: 'nationality', 
      label: t('investors.nationality', 'investments') || 'Nationality', 
      width: 130,
      sortable: true,
      render: (row: Investor) => row.nationality || '—'
    },
    { 
      key: 'phone', 
      label: t('investors.phone', 'investments') || 'Phone', 
      width: 140,
      sortable: true,
      render: (row: Investor) => row.phone || '—'
    },
    { 
      key: 'created_at', 
      label: t('investors.created_at', 'investments') || 'Created At', 
      width: 130,
      sortable: true,
      render: (row: Investor) => row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'
    },
    {
      key: 'added_by',
      label: t('investors.added_by', 'investments') || 'Added By',
      width: 130,
      sortable: false,
      render: (row: Investor) => row.user?.name || '—'
    },
    { 
      key: 'actions', 
      label: t('common.actions', 'shared') || 'Actions', 
      width: 100,
      render: (row: Investor) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/investments/investors/${row.id}/edit`)}
            title={t('common.view', 'shared') || 'View'} requiredPermission="investments.investors.view">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(row)}
            title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.investors.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
        </div>
      ) 
    },
  ];

  const tablePagination = {
    page: pagination?.currentPage || 1,
    totalPages: pagination?.lastPage || 1,
    totalItems: pagination?.total || 0,
    onPageChange: (newPage: number) => setPage(newPage),
  };
const entity = t('investors.investor') || "مستثمر"
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">{t('investors.title', 'investments') || 'Investors'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/investments/investors/create')} requiredPermission="investments.investors.create">{t('investors.add', 'investments') || 'Add Investor'}</Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3  ">
        <Input type="text" value={searchQuery} onChange={setSearchQuery} 
          placeholder={t('common.search', 'shared') || 'Search...'} 
          baseClasses={inputBaseClasses} className="w-64" />
      </div>

      {error && <ErrorState message={error} onRetry={() => setPage(prev => prev)} />}
      
      {!error && (
        <DataTable 
          columns={columns} 
          data={investors} 
          rowKey="id" 
          loading={loading}
          emptyMessage={t('investors.no_records', 'investments') || 'No investors found'}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
          onSort={handleSort}
          pagination={tablePagination}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title={t('common.delete', 'shared') || 'Delete'}
        message={t('common.delete_confirm', 'shared').replace('{name}', entity) || 'Are you sure you want to delete this?'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
        confirmLoading={confirmLoading}
      />
    </div>
  );
}
