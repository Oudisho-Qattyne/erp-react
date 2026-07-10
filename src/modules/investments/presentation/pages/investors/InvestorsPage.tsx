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
import { FilterDialog, type FilterField } from '../../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { toast } from 'sonner';
import { YesNo } from '../../../../../core/presentation/layouts/ui/card/YesNo';
import { Eye, Trash2, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function InvestorsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { entities: investors, getAll, remove, loadingMap, errorMap, pagination } = useEntityCrud<Investor>('/investments/investors', '/investments/investors');

  const [localSearch, setLocalSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Investor | null>(null);

  // Table State
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Filter State
  const [extraFilters, setExtraFilters] = useState<Record<string, any>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch Data (Server Side)
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);

    for (const [key, val] of Object.entries(extraFilters)) {
      if (val !== undefined && val !== '') {
        params.append(key, String(val));
      }
    }

    if (sortColumn) {
      params.append('sortColumn', sortColumn);
      params.append('sortOrder', sortOrder);
    }

    params.append('page', String(page));
    params.append('per_page', String(perPage));

    getAll(`/investments/investors?${params.toString()}`);
  }, [searchQuery, sortColumn, sortOrder, page, perPage, extraFilters]);

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val === '' || val === undefined) continue;
      if (val === 'true') parsed[key] = true;
      else if (val === 'false') parsed[key] = false;
      else parsed[key] = val;
    }
    setExtraFilters(parsed);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    setExtraFilters({});
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await remove(confirmDelete.id);
      toast.success(t('investors.deleted', 'investments') || 'Investor deleted');
    } catch {
      toast.error(t('investors.delete_error', 'investments') || 'Failed to delete investor');
    }
    setConfirmDelete(null);
  };

  const filterFields: FilterField[] = [
    { name: 'has_social_account', label: t('investors.filter_has_social_account', 'investments') || 'Has Social Account', type: 'checkbox' },
    { name: 'has_facebook_account', label: t('investors.filter_has_facebook_account', 'investments') || 'Has Facebook', type: 'checkbox' },
    { name: 'has_instagram_account', label: t('investors.filter_has_instagram_account', 'investments') || 'Has Instagram', type: 'checkbox' },
    { name: 'has_x_account', label: t('investors.filter_has_x_account', 'investments') || 'Has X (Twitter)', type: 'checkbox' },
    { name: 'has_linkedin_account', label: t('investors.filter_has_linkedin_account', 'investments') || 'Has LinkedIn', type: 'checkbox' },
    { name: 'is_possible_investor_in_future', label: t('investors.filter_is_possible_investor_in_future', 'investments') || 'Future Possible Investor', type: 'checkbox' },
    { name: 'has_phone_number', label: t('investors.filter_has_phone_number', 'investments') || 'Has Phone', type: 'checkbox' },
    { name: 'has_whatsapp_number', label: t('investors.filter_has_whatsapp_number', 'investments') || 'Has WhatsApp', type: 'checkbox' },
  ];

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
      key: 'is_possible_investor_in_future',
      label: t('investors.is_possible_investor_in_future', 'investments') || 'Future Possible',
      width: 130,
      sortable: true,
      render: (row: Investor) => <YesNo value={row.is_possible_investor_in_future} />
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

  const entity = t('investors.invistor') || "مستثمر"

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">{t('investors.title', 'investments') || 'Investors'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/investments/investors/create-future-possible')} requiredPermission="investments.investors.create">{t('investors.add_future_possible', 'investments') || 'Add Future Possible Investor'}</Button>
          <Button onClick={() => navigate('/investments/investors/create')} requiredPermission="investments.investors.create">{t('investors.add', 'investments') || 'Add Investor'}</Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Input type="text" value={localSearch} onChange={setLocalSearch}
          placeholder={t('common.search', 'shared') || 'Search...'}
          baseClasses={inputBaseClasses} className="w-64" />
        <Button variant="primary" onClick={() => { setSearchQuery(localSearch); setPage(1) }} size="sm" leftIcon={<Search size={14} />}>
          {t('common.search', 'shared') || 'Search'}
        </Button>
        <Button variant="outline" onClick={() => setIsFilterOpen(true)} size="sm" leftIcon={<Filter size={14} />}>
          {t('common.filter', 'shared') || 'Filter'}
        </Button>
        <Button variant="outline" onClick={handleResetFilter} size="sm">
          {t('common.reset', 'shared') || 'Reset'}
        </Button>
      </div>

      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={extraFilters}
        onFilter={handleApplyFilter}
        onCancel={() => setIsFilterOpen(false)}
        onReset={handleResetFilter}
      />

      {errorMap['getAll'] && <ErrorState message={errorMap['getAll']} onRetry={() => setPage(prev => prev)} />}

      {!errorMap['getAll'] && (
        <DataTable
          columns={columns}
          data={investors}
          rowKey="id"
          loading={loadingMap['getAll']}
          emptyMessage={t('investors.no_records', 'investments') || 'No investors found'}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
          onSort={handleSort}
          pagination={{
            page: pagination?.currentPage || 1,
            totalPages: pagination?.lastPage || 1,
            totalItems: pagination?.total || 0,
            onPageChange: (newPage: number) => setPage(newPage),
            itemsPerPage: perPage,
            onItemsPerPageChange: (size: number) => { setPerPage(size); setPage(1) },
            itemsPerPageOptions: [10, 25, 50, 100],
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title={t('common.delete', 'shared') || 'Delete'}
        message={t('common.delete_confirm', 'shared').replace('{name}', entity) || 'Are you sure you want to delete this?'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
        confirmLoading={loadingMap['remove']}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
      />
    </div>
  );
}
