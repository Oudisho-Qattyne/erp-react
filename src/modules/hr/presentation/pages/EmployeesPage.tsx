// src/modules/hr/presentation/pages/EmployeesPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { DataTable, type ColumnDef } from '../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { FilterDialog, type FilterField } from '../../../../core/presentation/layouts/ui/filter/FilterDialog';
import type { EmployeeListItem } from '../../domain/entities/EmployeeListItem';
import { EmployeeForm } from './EmployeeForm';
import { FormInput } from '../../../../core/presentation/layouts/ui/inputs/FormInput';
import Input from '../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../core/presentation/layouts/ui/inputs/styles';
import { LoadingState } from '../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../core/presentation/layouts/ui/state/ErrorState';
import { useManageEmployee } from '../hooks/useEmployees';
import { Filter, Search } from 'lucide-react';

export function EmployeesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  const genderOptions = [
    { value: '', label: t('employees.gender_all', 'hr') || 'الكل' },
    { value: 'male', label: t('employees.gender_male', 'hr') || 'ذكر' },
    { value: 'female', label: t('employees.gender_female', 'hr') || 'أنثى' },
  ];

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
    extraFilters,
    setSearch,
    setGender,
    setPage,
    setPerPage,
    setSortBy,
    setSortOrder,
    setExtraFilters,
    resetFilters,
    refetch,
    create, // from useManageEmployee
  } = useManageEmployee({ initialPerPage: 10 });

  const columns: ColumnDef<EmployeeListItem>[] = [
    {
      key: 'personal_id_number',
      label: t('employees.personal_id_number', 'hr') || 'الرقم الذاتي',
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
      render: (row) => (row.gender === 'male' ? (t('employees.gender_male', 'hr') || 'ذكر') : (t('employees.gender_female', 'hr') || 'أنثى')),
    },
    {
      key: 'created_at',
      label: t('employees.created_at', 'hr') || 'تاريخ الإنشاء',
      width: 160,
      render: (row) => row.created_at,
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

  const filterFields: FilterField[] = [
    { name: "gender", label: t("employees.gender", "hr"), type: "select", options: [
      { value: "", label: t("employees.gender_all", "hr") || "All" },
      { value: "male", label: t("employees.gender_male", "hr") },
      { value: "female", label: t("employees.gender_female", "hr") },
    ]},
    { name: "marital_status", label: t("employees.marital_status", "hr"), type: "select", options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "single", label: t("employees.marital_single", "hr") },
      { value: "married", label: t("employees.marital_married", "hr") },
      { value: "divorced", label: t("employees.marital_divorced", "hr") },
      { value: "widowed", label: t("employees.marital_widowed", "hr") },
    ]},
    { name: "blood_type", label: t("employees.blood_type", "hr"), type: "select", options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
      { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
      { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
      { value: "O+", label: "O+" }, { value: "O-", label: "O-" },
    ]},
    { name: "date_birth", label: t("employees.date_birth", "hr"), type: "date" },
    { name: "has_sham_cash_account", label: t("employees.has_sham_cash_account", "hr"), type: "select", options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "true", label: t("common.yes", "shared") },
      { value: "false", label: t("common.no", "shared") },
    ]},
    { name: "linked_to_user", label: t("employees.linked_to_user", "hr") || "Linked to User", type: "select", options: [
      { value: "", label: t("common.all", "shared") || "All" },
      { value: "true", label: t("common.yes", "shared") },
      { value: "false", label: t("common.no", "shared") },
    ]},
  ]

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {}
    for (const [key, val] of Object.entries(values)) {
      if (val !== "" && val !== undefined) parsed[key] = val
    }
    setExtraFilters(parsed)
    setPage(1)
    setIsFilterOpen(false)
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{t("employees.title", "hr") || "Employees"}</h1>
      {/* Filters Bar - Left side filters, Right side add button */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search input - smaller width */}
          <Input
            type="text"
            placeholder={t('employees.search_placeholder', 'hr') || 'بحث...'}
            value={localSearch}
            onChange={(val) => setLocalSearch(val as string)}
            baseClasses={inputBaseClasses}
            className="w-56"
          />

                   {/* Search & Reset buttons */}
          <Button variant="primary" onClick={() => { setSearch(localSearch); setPage(1) }} size="sm" leftIcon={<Search size={14} />}>
            {t('common.search', 'shared') || 'بحث'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)} leftIcon={<Filter size={14} />}>
            {t('common.filter', 'shared') || 'تصفية'}
          </Button>
          <Button variant="outline" onClick={resetFilters} size="sm">
            {t('common.reset', 'shared') || 'مسح'}
          </Button>
        </div>

        {/* Add button on the right */}
        <Button variant="primary" onClick={() => setIsAddDialogOpen(true)} requiredPermission="hr.employees.create">
          + {t('employees.add', 'hr') || 'إضافة موظف'}
        </Button>
      </div>

      {/* Table */}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!error && (
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
    <Dialog isOpen={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} title={t('employees.add_title', 'hr') || "إضافة موظف جديد"} size="2xl">
  <EmployeeForm
    onSubmit={handleCreateEmployee}
    onCancel={() => setIsAddDialogOpen(false)}
  />
</Dialog>
      <FilterDialog
        isOpen={isFilterOpen}
        fields={filterFields}
        initialValues={extraFilters}
        onFilter={handleApplyFilter}
        onCancel={() => setIsFilterOpen(false)}
        onReset={() => { setExtraFilters({}); setPage(1); setIsFilterOpen(false) }}
      />
    </div>
  );
}