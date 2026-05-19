// src/modules/hr/presentation/pages/EmployeesPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { Input } from '../../../../core/presentation/layouts/ui/inputs/TheInput';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { DataTable, type ColumnDef } from '../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import type { EmployeeListItem } from '../../domain/entities/EmployeeListItem';
import { useManageEmployee } from '../hooks/useEmployees';
import { EmployeeForm } from './EmployeeForm';

const genderOptions = [
  { value: '', label: 'الكل' },
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
];

export function EmployeesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const {
    employees,
    loading,
    error,
    pagination,
    search,
    gender,
    page,
    perPage,
    sortBy,
    sortOrder,
    setSearch,
    setGender,
    setPage,
    setPerPage,
    setSortBy,
    setSortOrder,
    resetFilters,
    refetch,
    create, // from useManageEmployee
  } = useManageEmployee({ initialPerPage: 10 });

  const columns: ColumnDef<EmployeeListItem>[] = [
    {
      key: 'internal_id',
      label: t('employees.internal_id', 'hr') || 'الرقم الداخلي',
      width: 120,
      sortable: true,
    },
    {
      key: 'national_id',
      label: t('employees.national_id', 'hr') || 'الرقم الوطني',
      width: 140,
      sortable: true,
    },
    {
      key: 'full_name',
      label: t('employees.full_name', 'hr') || 'الاسم الكامل',
      width: 200,
      sortable: true,
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
      sortable: true,
    },
  ];

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  const handleCreateEmployee = async (data: any) => {
    await create(data);
    setIsAddDialogOpen(false);
    refetch(); // refresh list
  };

  return (
    <div className="p-4 space-y-4">
      {/* Filters Bar - Left side filters, Right side add button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search input - smaller width */}
          <Input
            type="text"
            placeholder={t('employees.search_placeholder', 'hr') || 'بحث...'}
            value={search}
            onChange={(val) => setSearch(val as string)}
            className="w-56"
          />
          {/* Gender filter */}
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-card text-text text-sm focus:border-primary w-32"
          >
            {genderOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Search & Reset buttons */}
          <Button variant="primary" onClick={() => refetch()} size="sm">
            {t('common.search', 'shared') || 'بحث'}
          </Button>
          <Button variant="outline" onClick={resetFilters} size="sm">
            {t('common.reset', 'shared') || 'مسح'}
          </Button>
        </div>

        {/* Add button on the right */}
        <Button variant="primary" onClick={() => setIsAddDialogOpen(true)}>
          + {t('employees.add', 'hr') || 'إضافة موظف'}
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
          loading={loading}
          pagination={{
            page,
            totalPages: pagination.lastPage,
            totalItems: pagination.total,
            onPageChange: setPage,
            itemsPerPage: perPage,
            onItemsPerPageChange: setPerPage,
            itemsPerPageOptions: [5, 10, 20, 50],
          }}
          emptyMessage={t('employees.no_data', 'hr') || 'لا يوجد موظفون'}
        />
      )}

      {/* Add Employee Dialog */}
    <Dialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} title="إضافة موظف جديد" size="lg">
  <EmployeeForm
    onSubmit={handleCreateEmployee}
    onCancel={() => setIsAddDialogOpen(false)}
    columns={2}
  />
</Dialog>
    </div>
  );
}