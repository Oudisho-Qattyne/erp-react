// src/modules/hr/presentation/pages/EmployeesPage.tsx
import React, { useState } from 'react';
import type { EmployeeListItem } from '../../domain/entities/EmployeeListItem';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { Input } from '../../../../core/presentation/layouts/ui/inputs/TheInput';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { usePaginatedEmployees } from '../hooks/usePaginatedEmployees';
import { DataTable, type ColumnDef } from '../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { useNavigate } from 'react-router-dom';

const genderOptions = [
  { value: '', label: 'الكل' },
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
];

export function EmployeesPage() {
  const { t } = useLanguage();
  const {
    employees,
    loading,
    error,
    pagination,
    search,
    gender,
    page,
    perPage,
    setSearch,
    setGender,
    changePage,
    changePerPage,
    resetFilters,
    refetch,
  } = usePaginatedEmployees({ initialPerPage: 10 });
  const navigate = useNavigate() 
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };
  
  const handleFilterChange = (colKey: string, value: string) => {
    setFilters(prev => ({ ...prev, [colKey]: value }));
    // Optionally reset to page 1
    changePage(1);
  };
  
  const columns: ColumnDef<EmployeeListItem>[] = [
    {
      key: 'internal_id',
      label: t('employees.internal_id', 'hr') || 'الرقم الداخلي',
      width: 120,
    },
    {
      key: 'national_id',
      label: t('employees.national_id', 'hr') || 'الرقم الوطني',
      width: 140,
    },
    {
      key: 'full_name',
      label: t('employees.full_name', 'hr') || 'الاسم الكامل',
      width: 200,
    },
    {
      key: 'gender',
      label: t('employees.gender', 'hr') || 'الجنس',
      width: 100,
      render: (row) => (row.gender === 'male' ? 'ذكر' : 'أنثى'),
    },
    {
      key: 'created_at',
      label: t('employees.created_at', 'hr') || 'تاريخ الإنشاء',
      width: 160,
      render: (row) => new Date(row.created_at).toLocaleDateString('ar-SY'),
    },
  ];

  // Pagination helpers
  const totalPages = pagination.lastPage || 1;
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="p-4 space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 items-end">
        <Input
          type="text"
          placeholder={t('employees.search_placeholder', 'hr') || 'بحث بالرقم الداخلي، الوطني، أو الاسم'}
          value={search}
          onChange={(val) => setSearch(val as string)}
          className="w-72"
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="px-3 py-2 rounded-md border border-border bg-card text-text text-sm focus:border-primary"
        >
          {genderOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={resetFilters}>
          {t('common.reset', 'shared') || 'مسح الفلترة'}
        </Button>
        <Button variant="primary" onClick={() => refetch()}>
          {t('common.search', 'shared') || 'بحث'}
        </Button>
      </div>

      {/* Table */}
      {loading && <div className="py-8 text-center">{t('common.loading', 'shared') || 'جاري التحميل...'}</div>}
      {error && <div className="py-8 text-center text-danger">{error}</div>}
      {!loading && !error && (
        <DataTable
        columns={columns}
        data={employees}
        onRowClick={(row) => navigate(`/hr/employees/${row.id}`)}
        rowKey="id"
        sortColumn={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        filters={filters}
        onFilterChange={handleFilterChange}
        loading={loading}
        selectable={false}
        pagination={{
          page,
          totalPages: pagination.lastPage,
          totalItems: pagination.total,
          onPageChange: changePage,
          itemsPerPage: perPage,
          onItemsPerPageChange: changePerPage,
          itemsPerPageOptions: [5, 10, 20, 50],
        }}
        emptyMessage={t('employees.no_data', 'hr') || 'لا يوجد موظفون'}
      />
      )}

      {/* Pagination */}
      {!loading && !error && employees.length > 0 && (
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">
              {t('pagination.showing', 'shared') || 'عرض'} {employees.length} {t('pagination.of', 'shared') || 'من'} {pagination.total} {t('pagination.records', 'shared') || 'سجل'}
            </span>
            <select
              value={perPage}
              onChange={(e) => changePerPage(Number(e.target.value))}
              className="px-2 py-1 rounded border border-border text-sm"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} / {t('pagination.page', 'shared') || 'صفحة'}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() => changePage(page - 1)}
            >
              {t('pagination.previous', 'shared') || 'السابق'}
            </Button>
            <span className="text-sm">
              {t('pagination.page', 'shared') || 'صفحة'} {page} {t('pagination.of', 'shared') || 'من'} {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!canNext}
              onClick={() => changePage(page + 1)}
            >
              {t('pagination.next', 'shared') || 'التالي'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}