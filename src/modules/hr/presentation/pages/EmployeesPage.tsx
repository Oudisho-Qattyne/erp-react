// src/modules/hr/presentation/pages/EmployeesPage.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { DataTable, type ColumnDef } from '../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Dialog } from '../../../../core/presentation/layouts/ui/dialog/Dialog';
import { FilterDialog, type FilterField, type FilterLabelMaps } from '../../../../core/presentation/layouts/ui/filter/FilterDialog';
import { ActiveFilters } from '../../../../core/presentation/layouts/ui/filter/ActiveFilters';
import { createFilterFormatValue } from '../../../../core/presentation/layouts/ui/filter/filterLabels';
import type { EmployeeListItem } from '../../domain/entities/EmployeeListItem';
import { EmployeeForm } from './EmployeeForm';
import { FormInput } from '../../../../core/presentation/layouts/ui/inputs/FormInput';
import Input from '../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../core/presentation/layouts/ui/inputs/styles';
import { LoadingState } from '../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../core/presentation/layouts/ui/state/ErrorState';
import { useManageEmployee } from '../hooks/useEmployees';
import { useEntityCrud, useFaculties, useSpecializations } from '../hooks';
import type { University } from '../../../../core/domain/entities/education/University';
import type { OrganizationalLevels } from '../../../../core/domain/entities/organizationalLevels/organizationalLevels';
import type { MultiLanguage } from '../../../../core/domain/entities/EntityWithNameOnly';
import { AuditLog } from '../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { Filter, Search, History } from 'lucide-react';

export function EmployeesPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [auditItem, setAuditItem] = useState<EmployeeListItem | null>(null);
  const [labelMaps, setLabelMaps] = useState<FilterLabelMaps>({});
  const formatValue = useMemo(() => createFilterFormatValue(labelMaps), [labelMaps]);

  const { getAll: loadUniversities } = useEntityCrud<University>('/shared-kernal/universities', '/shared-kernal/universities');
  const { getAllByUniversity } = useFaculties();
  const { getAllByFaculty } = useSpecializations();
  const { getAll: loadOrgUnits } = useEntityCrud<OrganizationalLevels>('/hr/organizational-levels', '/hr/organizational-levels');

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

  const SORT_FIELD_MAP: Record<string, string> = {
    full_name: 'first_name',
    created_at: 'created_at',
  };

  const getLocalizedName = (name: string | MultiLanguage) =>
    typeof name === 'string' ? name : (name.ar || name.en || '');

  const computeUniversities = async () => {
    const response = await loadUniversities();
    return { options: [{ value: '', label: t("common.all", "shared") || "All" }, ...response.data.map((u) => ({ value: u.id, label: getLocalizedName(u.name) }))] };
  };

  const computeFaculties = async (values: Record<string, unknown>) => {
    const univId = values.university_id;
    if (!univId) return { options: [{ value: '', label: t("common.all", "shared") || "All" }], disabled: true };
    const response = await getAllByUniversity(Number(univId));
    return { options: [{ value: '', label: t("common.all", "shared") || "All" }, ...response.data.map((f) => ({ value: f.id, label: getLocalizedName(f.name) }))] };
  };

  const computeSpecializations = async (values: Record<string, unknown>) => {
    const facId = values.faculty_id;
    if (!facId) return { options: [{ value: '', label: t("common.all", "shared") || "All" }], disabled: true };
    const response = await getAllByFaculty(Number(facId));
    return { options: [{ value: '', label: t("common.all", "shared") || "All" }, ...response.data.map((s) => ({ value: s.id, label: getLocalizedName(s.name) }))] };
  };

  const computeOrgUnits = async () => {
    const response = await loadOrgUnits();
    return { options: [{ value: '', label: t("common.all", "shared") || "All" }, ...response.data.map((o) => ({ value: o.id, label: getLocalizedName(o.name) }))] };
  };

  const columns: ColumnDef<EmployeeListItem>[] = [
    {
      key: 'personal_id_number',
      label: t('employees.personal_id_number', 'hr') || 'الرقم الذاتي',
      width: 120,
      sortable: false,
    },
    {
      key: 'national_id',
      label: t('employees.national_id', 'hr') || 'الرقم الوطني',
      width: 140,
      sortable: false,
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
    {
      key: 'actions',
      label: t('common.actions', 'shared') || 'Actions',
      width: 80,
      render: (row) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)}
            title={t('employees.edit_log', 'hr') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const handleSort = (columnKey: string) => {
    const field = SORT_FIELD_MAP[columnKey];
    if (!field) return;
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleCreateEmployee = async (data: any) => {
    await create(data);
    setIsAddDialogOpen(false);
    refetch(); // refresh list
  };

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'gender') {
      if (value === 'male') return t('employees.gender_male', 'hr') || 'Male';
      if (value === 'female') return t('employees.gender_female', 'hr') || 'Female';
    }
    if (value === 'true') return t('common.yes', 'shared') || 'Yes';
    if (value === 'false') return t('common.no', 'shared') || 'No';
    return value;
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
    { name: "university_id", type: "select", searchable: true, label: t("employees.university", "hr"), compute: computeUniversities },
    { name: "faculty_id", type: "select", searchable: true, label: t("employees.faculty", "hr"), dependsOn: ["university_id"], compute: computeFaculties },
    { name: "specialization_id", type: "select", searchable: true, label: t("employees.specialization", "hr"), dependsOn: ["faculty_id"], compute: computeSpecializations },
    { name: "organizational_unit", type: "select", searchable: true, label: t("employees.org_unit_id", "hr") || "Organizational Unit", compute: computeOrgUnits },
  ]

  const handleApplyFilter = (values: Record<string, any>, maps?: FilterLabelMaps) => {
    const parsed: Record<string, any> = {}
    for (const [key, val] of Object.entries(values)) {
      if (val !== "" && val !== undefined) {
        if (["university_id", "faculty_id", "specialization_id", "organizational_unit"].includes(key)) {
          parsed[key] = Number(val)
        } else {
          parsed[key] = val
        }
      }
    }
    setExtraFilters(parsed)
    setLabelMaps(maps ?? {})
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
          <Button variant="outline" onClick={() => { resetFilters(); setLabelMaps({}); }} size="sm">
            {t('common.reset', 'shared') || 'مسح'}
          </Button>
        </div>

        {/* Add button on the right */}
        <Button variant="primary" onClick={() => setIsAddDialogOpen(true)} requiredPermission="hr.employees.create">
          + {t('employees.add', 'hr') || 'إضافة موظف'}
        </Button>
      </div>

      <ActiveFilters filters={extraFilters} fields={filterFields} className="mt-1" formatValue={formatValue} />

      {/* Table */}
      {error && <ErrorState message={error} onRetry={refetch} />}
      {!error && (
        <DataTable
          columns={columns}
          data={employees}
          onRowClick={(row) => window.open(`/hr/employees/${row.id}` , '_blank')}
          rowKey="id"
          sortColumn={Object.entries(SORT_FIELD_MAP).find(([, field]) => field === sortBy)?.[0] ?? undefined}
          sortOrder={sortOrder}
          onSort={handleSort}
          loading={loading}
          pagination={{
            page,
            totalPages: pagination.lastPage,
            totalItems: pagination.total,
            onPageChange: setPage,
            itemsPerPage: perPage,
            onItemsPerPageChange: (size) => { setPerPage(size); setPage(1) },
             itemsPerPageOptions: [10, 25, 50, 100],
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
        onReset={() => { setExtraFilters({}); setLabelMaps({}); setPage(1); setIsFilterOpen(false) }}
      />

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="employee"
        modelId={auditItem?.id}
        module="hr"
        labels={{
          title: t('employees.edit_log', 'hr') || 'Edit Log',
          event: t('employees.event', 'hr') || 'Event',
          created_at: t('employees.created_at', 'hr') || 'Created At',
          changed_by: t('employees.changed_by', 'hr') || 'Changed By',
          changes: t('employees.changes', 'hr') || 'Changes',
          field: t('employees.field', 'hr') || 'Field',
          old_value: t('employees.old_value', 'hr') || 'Old Value',
          new_value: t('employees.new_value', 'hr') || 'New Value',
          no_records: t('employees.no_edit_log', 'hr') || 'No edit logs found',
          subject_id: t('employees.subject_id', 'hr') || 'Employee ID',
        }}
        translateField={(key) => t(`employees.${key}`, 'hr') || key}
        translateValues={handleTranslateValues}
      />
    </div>
  );
}