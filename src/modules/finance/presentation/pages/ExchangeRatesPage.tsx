import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../core/presentation/hooks/data/useEntity';
import type { ExchangeRate } from '../../domain/entities/ExchangeRate';
import type { Currency } from '../../domain/entities/Currency';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { DataTable, type ColumnDef } from '../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { ErrorState } from '../../../../core/presentation/layouts/ui/state/ErrorState';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { FilterDialog, type FilterField } from '../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { ActiveFilters } from '../../../../core/presentation/layouts/ui/filter/ActiveFilters';
import { GenericCreateForm } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import Input from '../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../core/presentation/layouts/ui/inputs/styles';
import { getCreateExchangeRateFormSchema } from '../schemas/exchangeRateForm.schema';
import { buildExchangeRateFormFields, buildExchangeRateFormGroups } from '../forms/exchangeRateFormConfig';
import { CurrencyPickerDialog } from '../components/CurrencyPickerDialog';
import { getLocalizedName } from '../../../../core/presentation/utils/helpes';
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react';
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

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<ExchangeRate | null>(null);
  const [deleting, setDeleting] = useState<ExchangeRate | null>(null);
  const [localSearch, setLocalSearch] = useState('');

  const { entities: currencies, create: createCurrency, getAll: loadCurrencies } = useEntityCrud<Currency & { id: number }>(
    '/financial-management/currencies',
    '/financial-management/currencies',
  );

  useEffect(() => {
    loadCurrencies();
  }, []);

  const handleSearch = () => {
    list?.setSearch(localSearch);
    list?.setPage(1);
  };

  const handleCreate = async (data: any) => {
    try {
      const res = await create(data);
      toast.success(t('exchange_rate.created', MODULE) || 'Exchange rate created successfully');
      list?.refresh();
      setIsAddOpen(false);
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

  const columns: ColumnDef<ExchangeRate>[] = [
    {
      key: 'from_currency_code',
      label: t('exchange_rate.from_currency_code', MODULE) || 'From Currency',
      width: 160,
      sortable: true,
    },
    {
      key: 'to_currency_code',
      label: t('exchange_rate.to_currency_code', MODULE) || 'To Currency',
      width: 160,
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
      width: 100,
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(row)}
            title={t('exchange_rates.edit', MODULE) || 'Edit'}
            requiredPermission="financial.exchange-rates.update"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleting(row)}
            title={t('exchange_rate.delete', MODULE) || 'Delete'}
            requiredPermission="financial.exchange-rates.delete"
          >
            <Trash2 size={16} className="text-danger" />
          </Button>
        </div>
      ),
    },
  ];

  const filterFields: FilterField[] = [
    {
      name: 'from_currency_code',
      type: 'table-picker',
      label: t('exchange_rate.from_currency_code', MODULE) || 'From Currency',
      picker: CurrencyPickerDialog,
      valueKey: 'code',
      displayLabel: (code: any) => {
        const c = currencies.find((x) => x.code === code)
        return c ? `${getLocalizedName(c.name)} (${c.code})` : code || ''
      },
      pickerProps: { multiple: false },
    },
    {
      name: 'to_currency_code',
      type: 'table-picker',
      label: t('exchange_rate.to_currency_code', MODULE) || 'To Currency',
      picker: CurrencyPickerDialog,
      valueKey: 'code',
      displayLabel: (code: any) => {
        const c = currencies.find((x) => x.code === code)
        return c ? `${getLocalizedName(c.name)} (${c.code})` : code || ''
      },
      pickerProps: { multiple: false },
    },
    { name: 'effective_date', type: 'date', label: t('exchange_rate.effective_date', MODULE) || 'Effective Date' },
    { name: 'effective_from', type: 'date', label: t('exchange_rate.effective_from', MODULE) || 'Effective From' },
    { name: 'effective_to', type: 'date', label: t('exchange_rate.effective_to', MODULE) || 'Effective To' },
  ];

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = { page: 1, per_page: list?.perPage };
    for (const [key, val] of Object.entries(values)) {
      if (val !== '' && val !== undefined) parsed[key] = val;
    }
    list?.setFilter(parsed);
    setIsFilterOpen(false);
  };

  const filterInitialValues = useMemo(
    () => ({
      ...list?.filter,
      search: list?.filter.search ?? '',
    }),
    [list?.filter],
  );

  const fields = buildExchangeRateFormFields(t, { currencies });
  const groups = buildExchangeRateFormGroups(t);

  const editDefaultValues = editing
    ? {
        from_currency_code: editing.from_currency_code,
        to_currency_code: 'SYP',
        rate: editing.rate,
        effective_date: editing.effective_date,
      }
    : undefined;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('exchange_rates.title', MODULE) || 'Exchange Rates'}</h1>
        <Button
          variant="primary"
          onClick={() => setIsAddOpen(true)}
          leftIcon={<Plus size={16} />}
          requiredPermission="financial.exchange-rates.add"
        >
          {t('exchange_rates.add', MODULE) || 'Add Exchange Rate'}
        </Button>
      </div>

      {errorMap.list ? (
        <ErrorState message={errorMap.list} onRetry={() => list?.refresh()} />
      ) : (
        <div className="relative w-full">
          <div className="relative flex gap-3 py-3">
            {/* <div className="relative flex-1 max-w-sm">
              <Input
                type="text"
                placeholder={t('exchange_rates.search_placeholder', MODULE) || 'Search...'}
                value={localSearch}
                onChange={(val) => setLocalSearch(val as string)}
                baseClasses={inputBaseClasses}
              />
            </div>
            <Button variant="primary" size="sm" onClick={handleSearch} leftIcon={<Search size={14} />}>
              {t('common.search', 'shared') || 'Search'}
            </Button> */}
            <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
              {t('common.filter', 'shared') || 'Filter'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => list?.resetFilter()}>
              {t('common.reset', 'shared') || 'Reset'}
            </Button>
          </div>

          <ActiveFilters filters={filterInitialValues} fields={filterFields} className="mt-1" />

          <FilterDialog
            isOpen={isFilterOpen}
            fields={filterFields}
            initialValues={filterInitialValues}
            onFilter={handleApplyFilter}
            onCancel={() => setIsFilterOpen(false)}
            onReset={() => {
              list?.resetFilter();
              setIsFilterOpen(false);
            }}
          />

          <DataTable<ExchangeRate>
            columns={columns}
            data={rates}
            rowKey="id"
            loading={loadingMap.getAll}
            sortColumn={list?.filter.sortColumn}
            sortOrder={list?.filter.sortOrder}
            onSort={list?.setSort}
            emptyMessage={t('exchange_rates.no_data', MODULE) || 'No exchange rates found'}
            pagination={{
              page: list?.page ?? 1,
              totalPages: pagination?.lastPage ?? 1,
              totalItems: pagination?.total ?? 0,
              itemsPerPage: list?.perPage ?? 10,
              onPageChange: (page: number) => list?.setPage(page),
              onItemsPerPageChange: (size: number) => list?.setPerPage(size),
              itemsPerPageOptions: [10, 25, 50, 100],
            }}
          />
        </div>
      )}

      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={t('exchange_rates.add_title', MODULE) || 'Add New Exchange Rate'}
        size="md"
      >
        <GenericCreateForm
          schema={getCreateExchangeRateFormSchema(t)}
          fields={fields}
          groups={groups}
          defaultValues={{ to_currency_code: 'SYP' }}
          onSubmit={handleCreate}
          onSuccess={() => setIsAddOpen(false)}
          onCancel={() => setIsAddOpen(false)}
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
        title={t('exchange_rate.delete', MODULE) || 'Delete'}
        message={t('exchange_rate.delete_confirm', MODULE) || 'Are you sure you want to delete this exchange rate?'}
        type="danger"
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
        confirmLoading={loadingMap.delete}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
