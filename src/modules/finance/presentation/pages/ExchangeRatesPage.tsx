import { useMemo, useState } from 'react';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../core/presentation/hooks/data/useEntity';
import type { ExchangeRate } from '../../domain/entities/ExchangeRate';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { DataTable, type ColumnDef } from '../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../core/presentation/layouts/ui/state/ErrorState';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { FilterDialog, type FilterField } from '../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { GenericCreateForm, type FieldConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { AuditLog } from '../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import Input from '../../../../core/presentation/layouts/ui/inputs/Input';
import { getCreateExchangeRateFormSchema } from '../schemas/exchangeRateForm.schema';
import { Plus, Pencil, Trash2, History, Filter as FilterIcon } from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '../../../../core/presentation/utils/handleApiError';

const MODULE = 'finance';

export function ExchangeRatesPage() {
  const { t } = useLanguage();
  const { entities: rates, create, update, remove, loadingMap, errorMap, list, pagination } = useEntityCrud<ExchangeRate>(
    '/financial-management/exchange-rates',
    '/financial-management/exchange-rates',
    {
      listState: true,
      paginate: true,
      defaultPerPage: 10,
      defaultSortColumn: 'created_at',
      defaultSortOrder: 'desc',
    },
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ExchangeRate | null>(null);
  const [deleting, setDeleting] = useState<ExchangeRate | null>(null);
  const [auditItem, setAuditItem] = useState<ExchangeRate | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleCreate = async (data: any) => {
    try {
      const res = await create(data);
      toast.success(t('exchange_rate.created', MODULE) || 'Exchange rate created successfully');
      list?.refresh();
      setIsCreateOpen(false);
      return res;
    } catch (err: any) {
      handleApiError(err, { module: MODULE });
      throw err;
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editing) return;
    try {
      const res = await update(editing.id, data);
      toast.success(t('exchange_rate.updated', MODULE) || 'Exchange rate updated successfully');
      list?.refresh();
      setEditing(null);
      return res;
    } catch (err: any) {
      handleApiError(err, { module: MODULE });
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove(deleting.id);
      toast.success(t('exchange_rate.deleted', MODULE) || 'Exchange rate deleted successfully');
      setDeleting(null);
      list?.refresh();
    } catch (err: any) {
      handleApiError(err, { module: MODULE });
    }
  };

  const filterFields: FilterField[] = [
    { name: 'from_currency_code', label: t('exchange_rate.from_currency_code', MODULE) || 'From Currency', type: 'text' },
    { name: 'to_currency_code', label: t('exchange_rate.to_currency_code', MODULE) || 'To Currency', type: 'text' },
    { name: 'effective_date', label: t('exchange_rate.effective_date', MODULE) || 'Effective Date', type: 'date' },
    { name: 'effective_from', label: t('exchange_rate.effective_from', MODULE) || 'Effective From', type: 'date' },
    { name: 'effective_to', label: t('exchange_rate.effective_to', MODULE) || 'Effective To', type: 'date' },
  ];

  const filterInitialValues = useMemo(() => {
    const excluded = ['search', 'sortColumn', 'sortOrder'];
    const entries = Object.entries(list?.filter ?? {}).filter(([k]) => !excluded.includes(k));
    return Object.fromEntries(entries.map(([k, v]) => [k, v === undefined || v === null ? '' : v]));
  }, [list?.filter]);

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {};
    for (const [key, val] of Object.entries(values)) {
      parsed[key] = val === '' || val === undefined ? undefined : val;
    }
    list?.setFilter(parsed);
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    list?.resetFilter();
    setIsFilterOpen(false);
  };

  const columns: ColumnDef<ExchangeRate>[] = [
    {
      key: 'from_currency_code',
      label: t('exchange_rate.from_currency_code', MODULE) || 'From',
      width: 140,
      sortable: true,
    },
    {
      key: 'to_currency_code',
      label: t('exchange_rate.to_currency_code', MODULE) || 'To',
      width: 140,
      sortable: true,
    },
    {
      key: 'rate',
      label: t('exchange_rate.rate', MODULE) || 'Rate',
      width: 140,
      sortable: true,
      render: (row) => Number(row.rate).toFixed(4),
    },
    {
      key: 'effective_date',
      label: t('exchange_rate.effective_date', MODULE) || 'Effective Date',
      width: 160,
      sortable: true,
    },
    {
      key: 'created_at',
      label: t('exchange_rate.created_at', MODULE) || 'Created At',
      width: 160,
      sortable: true,
      render: (row) => row.created_at || '—',
    },
    {
      key: 'actions',
      label: '',
      width: 120,
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            title={t('exchange_rate.edit', MODULE) || 'Edit'}
            className="rounded-md p-2 text-text-muted hover:bg-surface-hover hover:text-primary"
            onClick={() => setEditing(row)}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            title={t('exchange_rate.audit', MODULE) || 'History'}
            className="rounded-md p-2 text-text-muted hover:bg-surface-hover hover:text-primary"
            onClick={() => setAuditItem(row)}
          >
            <History className="h-4 w-4" />
          </button>
          <button
            type="button"
            title={t('exchange_rate.delete', MODULE) || 'Delete'}
            className="rounded-md p-2 text-text-muted hover:bg-surface-hover hover:text-error"
            onClick={() => setDeleting(row)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const fields: FieldConfig<any>[] = [
    { name: 'from_currency_code', label: t('exchange_rate.from_currency_code', MODULE) || 'From Currency', type: 'text', required: true, group: 'details' },
    { name: 'to_currency_code', label: t('exchange_rate.to_currency_code', MODULE) || 'To Currency', type: 'text', required: true, group: 'details' },
    { name: 'rate', label: t('exchange_rate.rate', MODULE) || 'Rate', type: 'number', required: true, group: 'details' },
    { name: 'effective_date', label: t('exchange_rate.effective_date', MODULE) || 'Effective Date', type: 'date', required: true, group: 'details' },
  ];

  const groups = [
    {
      group: 'details',
      title: t('exchange_rate.details', MODULE) || 'Details',
      columns: 2,
      rows: [['from_currency_code', 'to_currency_code'], ['rate', 'effective_date']],
    },
  ];

  const editDefaultValues = editing
    ? {
        from_currency_code: editing.from_currency_code,
        to_currency_code: editing.to_currency_code,
        rate: editing.rate,
        effective_date: editing.effective_date,
      }
    : undefined;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">{t('exchange_rates.title', MODULE) || 'Exchange Rates'}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {t('exchange_rates.search_placeholder', MODULE) || 'Manage currency exchange rates'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsFilterOpen(true)}>
            <FilterIcon className="h-4 w-4" /> {t('common.filter', 'shared') || 'Filter'}
          </Button>
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" /> {t('exchange_rates.add', MODULE) || 'Add Exchange Rate'}
          </Button>
        </div>
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          type="text"
          value={list?.filter.search ?? ''}
          onChange={(value: string) => list?.setSearch(value)}
          placeholder={t('exchange_rates.search_placeholder', MODULE) || 'Search...'}
        />
      </div>

      {errorMap.list ? (
        <ErrorState
          message={errorMap.list}
          retryLabel={t('common.retry', 'shared') || 'Retry'}
          onRetry={() => list?.refresh()}
        />
      ) : (
        <DataTable<ExchangeRate>
          columns={columns}
          data={rates}
          loading={loadingMap.list}
          sortColumn={list?.filter.sortColumn}
          sortOrder={list?.filter.sortOrder}
          onSort={list?.setSort}
          emptyMessage={t('exchange_rates.no_data', MODULE) || 'No exchange rates found'}
          pagination={
            list
              ? {
                  page: list.page,
                  totalPages: pagination?.lastPage ?? 1,
                  totalItems: pagination?.total ?? 0,
                  onPageChange: list.setPage,
                  itemsPerPage: list.perPage,
                  onItemsPerPageChange: list.setPerPage,
                }
              : undefined
          }
        />
      )}

      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={t('exchange_rates.add_title', MODULE) || 'Add New Exchange Rate'}
        size="md"
      >
        <GenericCreateForm
          schema={getCreateExchangeRateFormSchema(t)}
          fields={fields}
          groups={groups}
          onSubmit={handleCreate}
          onSuccess={() => setIsCreateOpen(false)}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('exchange_rates.add', MODULE) || 'Add'}
        />
      </Dialog>

      <Dialog
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={t('exchange_rates.edit_title', MODULE) || 'Edit Exchange Rate'}
        size="md"
      >
        {editing && (
          <GenericCreateForm
            schema={getCreateExchangeRateFormSchema(t)}
            fields={fields}
            groups={groups}
            defaultValues={editDefaultValues}
            onSubmit={handleUpdate}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
            submitLabel={t('common.edit', 'shared') || 'Save'}
          />
        )}
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleting}
        title={t('exchange_rate.delete', MODULE) || 'Delete Exchange Rate'}
        message={t('exchange_rate.delete_confirm', MODULE) || 'Are you sure you want to delete this exchange rate?'}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        type="danger"
        confirmLoading={loadingMap.delete}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        module="finance"
        model="exchange_rate"
        modelId={auditItem?.id}
        labels={{
          created_at: t('audit.created_at', 'shared') || 'Created At',
          event: t('audit.event', 'shared') || 'Event',
          old_value: t('audit.old_value', 'shared') || 'Old Value',
          new_value: t('audit.new_value', 'shared') || 'New Value',
          changed_by: t('audit.actor', 'shared') || 'Actor',
        }}
      />

      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={filterInitialValues}
        onFilter={handleApplyFilter}
        onCancel={() => setIsFilterOpen(false)}
        onReset={handleResetFilter}
      />
    </div>
  );
}
