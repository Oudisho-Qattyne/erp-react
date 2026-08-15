import { z } from 'zod';
import type { ReactNode } from 'react';
import type { FieldConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { ComputedProps } from '../../../../core/presentation/layouts/ui/inputs/hooks/useDependentField';

type Translate = (key: string, module?: string) => string;

type CreateFormRenderer = (
  onSuccess: (value: number | string, item?: unknown) => void,
  onCancel: () => void,
  dependentData?: Record<string, unknown>
) => ReactNode;

type OptionsComputedProps = Omit<ComputedProps, 'options'> & {
  options: { value: string; label: string; is_default?: boolean }[];
};

export interface EmployeePersonalFieldsDeps {
  renderCountryCreateForm: CreateFormRenderer;
  renderCityCreateForm: CreateFormRenderer;
  renderChronicDiseaseCreateForm: CreateFormRenderer;
  renderEmployeeStatusCreateForm: CreateFormRenderer;
  computeCountries: () => Promise<ComputedProps>;
  computeChronicDiseases: () => Promise<ComputedProps>;
  computeEmployeeStatuses: () => Promise<ComputedProps>;
  computeResidenceCities: (values: Record<string, unknown>) => Promise<OptionsComputedProps>;
  infoButtonEmployeeStatus?: () => void;
}

export interface EmployeeEmploymentFieldsDeps {
  renderJobStatusCreateForm: CreateFormRenderer;
  computeJobStatuses: (values: Record<string, unknown>) => Promise<OptionsComputedProps>;
  infoButtonJobStatus?: () => void;
}

export const buildEmployeePersonalFields = (t: Translate, deps: EmployeePersonalFieldsDeps): FieldConfig[] => [
  { name: 'personal_id_number', label: t('employees.personal_id_number', 'hr') || 'الرقم الذاتي', type: 'numeric' },
  { name: 'national_id', label: t('employees.national_id', 'hr') || 'الرقم الوطني', required: true, type: 'numeric' },
  { name: 'first_name', type: 'alpha', label: t('employees.first_name', 'hr') || 'الاسم الأول', required: true },
  { name: 'father_name', type: 'alpha', label: t('employees.father_name', 'hr') || 'اسم الأب' },
  { name: 'grandfather_name', type: 'alpha', label: t('employees.grandfather_name', 'hr') || 'اسم الجد' },
  { name: 'last_name', type: 'alpha', label: t('employees.last_name', 'hr') || 'اسم العائلة', required: true },
  { name: 'mother_name', type: 'alpha', label: t('employees.mother_name', 'hr') || 'اسم الأم' },
  {
    name: 'gender',
    label: t('employees.gender', 'hr') || 'الجنس',
    type: 'select',
    options: [
      { value: 'male', label: t('employees.gender_male', 'hr') || 'ذكر' },
      { value: 'female', label: t('employees.gender_female', 'hr') || 'أنثى' },
    ],
    required: true,
  },
  { name: 'date_birth', type: 'date', label: t('employees.date_birth', 'hr') || 'تاريخ الميلاد' },
  { name: 'place_birth', type: 'alpha', label: t('employees.place_birth', 'hr') || 'مكان الميلاد' },
  {
    name: 'marital_status',
    label: t('employees.marital_status', 'hr') || 'الحالة الاجتماعية',
    type: 'select',
    options: [
      { value: 'single', label: t('employees.marital_single', 'hr') || 'أعزب' },
      { value: 'married', label: t('employees.marital_married', 'hr') || 'متزوج' },
      { value: 'divorced', label: t('employees.marital_divorced', 'hr') || 'مطلق' },
      { value: 'widowed', label: t('employees.marital_widowed', 'hr') || 'أرمل' },
    ],
    required: true,
  },
  {
    name: 'spouses',
    label: t('employees.spouses', 'hr') || 'Employee spouses',
    dependsOn: ['marital_status', 'gender'],
    type: 'data-matrix',
    matrixFields: [
      {
        label: t('employees.spouses_plural', 'hr') || 'Employee spouses names',
        name: 'name',
        type: 'alpha',
      },
      {
        label: t('employees.spouses_workplace', 'hr') || 'Employee spouses workplace',
        name: 'workplace',
        type: 'alpha',
      },
    ],
    compute: (values) => {
      if (values.marital_status == 'single')
        return { disabled: true, value: [] };
      if (values.gender == 'female')
        return {
          disabled: false,
          numberOfRows: 1,
          matrixFields: [
            {
              label: t('employees.spouses_single', 'hr') || 'Husband Name',
              name: 'name',
              type: 'alpha',
            },
            {
              label: t('employees.employee_spouse_workplace_husband', 'hr') || "Husband's workplace",
              name: 'workplace',
              type: 'alpha',
            },
          ],
        };
      if (values.gender == 'male')
        return {
          disabled: false,
          numberOfRows: 4,
          matrixFields: [
            {
              label: t('employees.spouses_plural', 'hr') || "Employee spouses' Names",
              name: 'name',
              type: 'alpha',
            },
            {
              label: t('employees.employee_spouse_workplace_wife', 'hr') || "Wife's workplace",
              name: 'workplace',
              type: 'alpha',
            },
          ],
        };
      return { disabled: false };
    },
    rowSchema: z.object({
      name: z.string().nullable().optional(),
    }),
  },
  {
    name: 'number_of_children',
    label: t('employees.number_of_children', 'hr') || 'عدد الأولاد',
    dependsOn: ['marital_status'],
    compute: (values) => {
      if (values.marital_status == 'single')
        return { disabled: true, value: null };

      return { disabled: false, required: true };
    },
    type: 'number',
  },
  {
    name: 'children',
    label: t('employees.children', 'hr') || 'الأولاد',
    dependsOn: ['marital_status', 'number_of_children'],
    compute: (values) => {
      if (values.marital_status == 'single' || values.number_of_children <= 0)
        return { disabled: true, numberOfRows: 0, value: [] };

      return { disabled: false, numberOfRows: values.number_of_children };
    },
    type: 'data-matrix',
    matrixFields: [
      {
        label: t('employees.child_name', 'hr') || 'عدد الأولاد',
        name: 'name',
        type: 'text',
      },
      {
        label: t('employees.date_birth', 'hr') || 'تاريخ الميلاد',
        name: 'birthdate',
        type: 'date',
        required: true,
      },
    ],
    rowSchema: z.object({
      name: z.string().min(1, t('employee_form.validation.name_invalid', 'hr') || 'اسم الابن مطلوب').nullable(),
      birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('employee_form.validation.birthdate_invalid', 'hr') || 'تاريخ الولادة بصيغة YYYY-MM-DD'),
    }),
  },
  {
    name: 'blood_type',
    type: 'select',
    options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({ value: v, label: v })),
    label: t('employees.blood_type', 'hr') || 'فصيلة الدم',
  },
  { name: 'phone_number', type: 'numeric', label: t('employees.phone_number', 'hr') || 'رقم الهاتف' },
  { name: 'sham_cash_account', label: t('employees.sham_cash_account', 'hr') || 'حساب الشام كاش' },
  {
    name: 'residence_country_id',
    type: 'select-or-create',
    searchable: true,
    label: t('employees.country', 'hr') || 'الدولة',
    required: true,
    createTitle: t('employee_form.add_country', 'hr') || 'إضافة دولة جديدة',
    labelPath: 'data.name',
    renderCreateForm: deps.renderCountryCreateForm,
    compute: deps.computeCountries,
  },
  {
    name: 'residence_city_id',
    type: 'select-or-create',
    searchable: true,
    label: t('employees.city', 'hr') || 'المدينة',
    required: true,
    dependsOn: ['residence_country_id'],
    compute: deps.computeResidenceCities,
    createTitle: t('employee_form.add_city', 'hr') || 'إضافة مدينة جديدة',
    labelPath: 'data.name',
    renderCreateForm: deps.renderCityCreateForm,
  },
  {
    name: 'residential_area_details',
    label: t('employees.residential_area_details', 'hr') || 'تفاصيل المنطقة السكنية',
  },
  { name: 'civil_registry_record', type: 'alphanumeric', label: t('employees.civil_registry_record', 'hr') || 'رقم القيد المدني' },
  { name: 'health_status', type: 'alpha', label: t('employees.health_status', 'hr') || 'الحالة الصحية' },
  { name: 'injury_details', label: t('employees.injury_details', 'hr') || 'تفاصيل الإصابات' },
  { name: 'injury_date', type: 'date', label: t('employees.injury_date', 'hr') || 'تاريخ الإصابة' },
  {
    name: 'chronic_disease_ids',
    type: 'multi-select-or-create',
    searchable: true,
    label: t('employees.chronic_diseases', 'hr') || 'تاريخ الإصابة',
    labelPath: 'data.name',
    requiredPermission: 'hr.chronic-diseases.list',
    createButtonPermission: 'hr.chronic-diseases.create',
    renderCreateForm: deps.renderChronicDiseaseCreateForm,
    compute: deps.computeChronicDiseases,
  },
  {
    name: 'employee_status_id',
    type: 'select-or-create',
    searchable: true,
    label: t('employees.employee_status_id', 'hr') || 'Employee Status',
    requiredPermission: 'hr.employee-statuses.list',
    createButtonPermission: 'hr.employee-statuses.create',
    labelPath: 'data.name',
    infoButton: deps.infoButtonEmployeeStatus,
    renderCreateForm: deps.renderEmployeeStatusCreateForm,
    required: true,
    compute: deps.computeEmployeeStatuses,
  },
  {
    name: 'employee_status_note',
    type: 'text',
    label: t('employees.employee_status_note', 'hr') || 'ملاحظة حالة الموظف',
    dependsOn: ['employee_status_id'],
    compute: async (values) => {
      if (!values.employee_status_id) {
        return { disabled: true };
      }
      return { disabled: false };
    },
  },
];

export const buildEmployeeEmploymentFields = (t: Translate, deps: EmployeeEmploymentFieldsDeps): FieldConfig[] => [
  { name: 'employment_details.job_title', type: 'alpha', label: t('employees.job_title', 'hr') || 'المسمى الوظيفي' },
  { name: 'assigned_job', type: 'alpha', label: t('employees.assigned_job', 'hr') || 'العمل المكلف به', required: true },
  { name: 'employment_details.appointment_date', type: 'date', label: t('employees.appointment_date', 'hr') || 'تاريخ التعيين' },
  { name: 'employment_details.job_category', type: 'alpha', label: t('employees.job_category', 'hr') || 'التصنيف الوظيفي' },
  {
    name: 'job_status_id',
    label: t('employees.job_status', 'hr') || 'الحالة الوظيفية',
    required: true,
    searchable: true,
    labelPath: 'data.name',
    type: 'select-or-create',
    requiredPermission: 'hr.job-statuses.list',
    createButtonPermission: 'hr.job-statuses.create',
    infoButton: deps.infoButtonJobStatus,
    renderCreateForm: deps.renderJobStatusCreateForm,
    compute: deps.computeJobStatuses,
  },
  {
    name: 'job_status_note',
    label: t('employees.job_status_note', 'hr') || 'ملاحظات الحالة الوظيفية',
    dependsOn: ['job_status_id'],
    compute: async (values) => {
      if (!values.job_status_id) {
        return { disabled: true };
      }
      return { disabled: false };
    },
  },
];