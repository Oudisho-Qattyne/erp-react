// src/modules/hr/presentation/components/EmployeeForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import { useCities, useEntityCrud, useFaculties, useRegions, useSpecializations } from '../hooks';
import { CityFormSchema } from '../../../../core/presentation/schemas/regions/cityForm.schema';
import { RegionFormSchema } from '../../../../core/presentation/schemas/regions/regionForm.schema';
import type { University } from '../../../../core/domain/entities/education/University';
import { UniversityFormSchema } from '../../../../core/presentation/schemas/education/universityForm.schema';
import { FacultyFormSchema } from '../../../../core/presentation/schemas/education/facultyForm.schema';
import { SpecializationFormSchema } from '../../../../core/presentation/schemas/education/specializationForm.schema';
import type { OrganizationalLevels } from '../../../../core/domain/entities/organizationalLevels/organizationalLevels';
import { FormInput, type FormInputProps } from '../../../../core/presentation/layouts/ui/inputs/FormInput';
import { getCreateEmployeeSchema, type EmployeeFormValues } from '../schemas/employeeForm';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { GenericCreateForm, type FieldConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { FormProvider } from 'react-hook-form';
import { useUnsavedChanges } from '../../../../core/presentation/hooks/useUnsavedChanges';
import { ConfirmDialog } from '../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import type { Country } from '../../../../core/domain/entities/regions/Country';
import { CountryFormSchema } from '../../../../core/presentation/schemas/regions/countryForm.schema';
import { OrganizationalUnitTreeSelect } from '../components/OrganizationalUnitTreeSelect';
import { useDynamicForm } from '../../../../core/presentation/hooks/useDynamicForm221';
import { useLanguage } from '../../../../core/presentation/context/i18n/I18nProvider';
import type { ChronicDiseases } from '../../../../core/domain/entities/chronicDiseases/chronicDiseases';
import { EntityFormSchema } from '../../../../core/presentation/schemas/entityForm.schema copy';
import type { JobStatus } from '../../domain/entities/jobStatus/jobStatus';
import type { EmployeeStatus } from '../../domain/entities/employeeStatus/employeeStatus';
import { EmployeeStatusFormSchema } from '../schemas/employeeStatus/employeeStatus';
import { EmployeeStatusLogsDialog } from '../components/employee/EmployeeStatuseLogsDialog';
import { JobStatusLogsDialog } from '../components/employee/JobStatusLogsDialog';

// -----------------------------------------------------------------------------
// Helper: Generic Create Form wrapper (with explicit types)
// -----------------------------------------------------------------------------


export const EMPLOYEE_EMPTY_DEFAULTS = {
  internal_id: null,
  national_id: null,
  first_name: null,
  father_name: null,
  grandfather_name: null,
  last_name: null,
  mother_name: null,
  gender: 'male',
  date_birth: null,
  place_birth: null,
  assigned_job: null,
  marital_status: 'single',
  number_of_children: null,
  spouse_name: null,
  spouse_workplace: null,
  blood_type: null,
  phone_number: null,
  sham_cash_account: null,
  residence_country_id: null,
  residence_city_id: null,
  residence_region_id: null,
  residential_area_details: null,
  civil_registry_record: null,
  health_status: null,
  injury_details: null,
  injury_date: null,
  chronic_disease_ids: [],
  employment_details: {
    job_title: null,
    org_unit_id: null,
    status: 'active',
    appointment_date: null,
    contract_type: null,
    contract_nature: null,
    job_category: null,

    workplace_city_id: null,
  },
  job_status_id: null,
  job_status_note: null,
  employee_status_id: null,
  employee_status_note: null,
  educations: [],
  children: []
};

function CreateEntityForm<T>({
  schema,
  onSubmit,
  onSuccess,
  onCancel,
  title,
  defaultValues,
  fields,
  submitLabel,
}: {
  schema: z.ZodSchema<any>;
  onSubmit: (data: any) => Promise<T>;
  onSuccess: (id: number, item: T) => void;
  onCancel: () => void;
  title: string;
  defaultValues?: Record<string, any>;
  fields?: FieldConfig[];
  submitLabel?: string;
}) {
  const { t } = useLanguage();
  return (
    <GenericCreateForm
      fields={fields}
      defaultValues={defaultValues}
      schema={schema}
      onSubmit={async (data: any) => {
        return await onSubmit(data);
      }}
      onSuccess={onSuccess}
      onCancel={onCancel}
      submitLabel={submitLabel || `${t('common.add', 'shared') || 'إضافة'} ${title}`}
    />
  );
}


function UniversityCreateForm({ onSuccess, onCancel }: { onSuccess: (id: number, item: any) => void; onCancel: () => void }) {
  const { t } = useLanguage();
  const { create: createUniversity } = useEntityCrud<University>('/shared-kernal/universities', '/shared-kernal/universities');
  return <CreateEntityForm defaultValues={{ name: "" }} schema={UniversityFormSchema} fields={[{ name: 'name', label: t('employees.university', 'hr') || 'اسم الجامعة', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'قيمة افتراضية', required: false, type: 'checkbox' }]}
    onSubmit={async (data) => {

      return await createUniversity(data)

    }} onSuccess={onSuccess} onCancel={onCancel} title={t('employees.university', 'hr') || "جامعة"} submitLabel={t('employee_form.add_university', 'hr') || "إضافة جامعة"} />;
}

function FacultyCreateForm({ onSuccess, onCancel, universityId }: { onSuccess: (id: number, item: any) => void; onCancel: () => void; universityId?: number }) {
  const { t } = useLanguage();
  const { create: createFaculty } = useFaculties();
  const schemaWithoutUni = FacultyFormSchema.omit({ university_id: true });
  return (
    <GenericCreateForm
      fields={[{ name: 'name', label: t('employees.faculty', 'hr') || 'اسم الكلية', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'قيمة افتراضية', required: false, type: 'checkbox' }]}
      schema={schemaWithoutUni}
      onSubmit={async (data: any) => {

        const payload = {
          ...data,
          name: data.name,
          university_id: universityId
        }
        return await createFaculty(payload);
      }}
      onSuccess={onSuccess}
      onCancel={onCancel}
      submitLabel={t('employee_form.add_faculty', 'hr') || "إضافة كلية"}
    />
  );
}

function SpecializationCreateForm({ onSuccess, onCancel, facultyId }: { onSuccess: (id: number, item: any) => void; onCancel: () => void; facultyId?: number }) {
  const { t } = useLanguage();
  const { create: createSpecialization } = useSpecializations();
  const SpecializationSchema = SpecializationFormSchema.omit({ Faculty_id: true })
  return (
    <GenericCreateForm
      fields={[{ name: 'name', label: t('employees.specialization', 'hr') || 'اسم الاختصاص', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'قيمة افتراضية', required: false, type: 'checkbox' }]}
      schema={SpecializationSchema}
      defaultValues={{ faculty_id: facultyId }}
      onSubmit={async (data: any) => {
        const payload = {
          ...data,
          name: data.name,
          faculty_id: facultyId
        }
        return await createSpecialization(payload);
      }}
      onSuccess={onSuccess}
      onCancel={onCancel}
      submitLabel={t('employee_form.add_specialization', 'hr') || "إضافة تخصص"}
    />
  );
}

function JobStatusCreateForm({ onSuccess, onCancel, facultyId }: { onSuccess: (id: number, item: any) => void; onCancel: () => void; facultyId?: number }) {
  const { t } = useLanguage();

  const { entities: items, getAll, create: createJobStatus, update, remove, loading, error } = useEntityCrud<JobStatus>('/hr/job-statuses', '/hr/job-statuses');
  return <CreateEntityForm defaultValues={{ name: "" }} schema={UniversityFormSchema} fields={[{ name: 'name', label: t('employee_form.job_status', 'hr') || 'الحالة الوظيفية', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'قيمة افتراضية', required: false, type: 'checkbox' }]}
    onSubmit={async (data) => {
      return await createJobStatus(data)

    }} onSuccess={onSuccess} onCancel={onCancel} title={t('employee_form.job_status', 'hr') || "الحالة الوظيفية"} submitLabel={t('employee_form.add_job_status', 'hr') || "إضافة حالة وظيفية"} />;
}
// function OrgUnitCreateForm({ onSuccess, onCancel }: { onSuccess: (id: number, item: any) => void; onCancel: () => void }) {
//   const { create: createOrgUnit } = useEntityCrud<OrganizationalLevels>('', '');
//   return <CreateEntityForm schema={organizationalLevelFormSchema} onSubmit={createOrgUnit} onSuccess={onSuccess} onCancel={onCancel} title="وحدة تنظيمية" />;
// }

// -----------------------------------------------------------------------------
// Field configurations (static)
// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
// Main EmployeeForm Component (pure form, no internal dialog)
// -----------------------------------------------------------------------------
export interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormValues>;
  onSubmit: (data: EmployeeFormValues) => void | Promise<void>;
  onCancel?: () => void;
  columns?: 1 | 2 | 3 | 4;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  employee_id?: number
}

const getNestedValue = (obj: any, path: string): any => {
  if (obj && obj[path] !== undefined) {
    return obj[path];
  }
  return path.split('.').reduce((current, key) => {
    const index = Number(key);
    if (!isNaN(index) && Array.isArray(current)) {
      return current[index];
    }
    return current?.[key];
  }, obj);
};

export function EmployeeForm({
  defaultValues,
  onSubmit,
  onCancel,
  columns = 2,
  submitLabel,
  cancelLabel,
  loading = false,
  employee_id
}: EmployeeFormProps) {
  const { t } = useLanguage();
  const actualSubmitLabel = submitLabel || t('employee_form.save', 'hr') || 'حفظ الموظف';
  const actualCancelLabel = cancelLabel || t('employee_form.cancel', 'hr') || 'إلغاء';
  const schema = getCreateEmployeeSchema(t)
  const { form: methods } = useDynamicForm({
    schema: schema,
    defaultValues: { ...EMPLOYEE_EMPTY_DEFAULTS, ...defaultValues } as EmployeeFormValues,
    mode: 'onChange',
  });
  const [statusLogsOpen, setStatusLogsOpen] = useState<boolean>(false)
  const [jobStatusLogsOpen, setJobStatusLogsOpen] = useState<boolean>(false)
  const { handleSubmit, formState, watch, setValue } = methods;
  const { isValid, isSubmitting, errors, isDirty } = formState;

  const { showConfirm, confirmNavigation, cancelNavigation, attemptNavigation } = useUnsavedChanges(isDirty)

  const prevErrorCount = useRef(0)
  useEffect(() => {
    const keys = Object.keys(errors)
    if (keys.length > 0 && keys.length !== prevErrorCount.current) {
      const el = document.querySelector(`[for="${keys[0]}"]`)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    prevErrorCount.current = keys.length
  }, [errors])

  const educations = watch('educations') || [];

  // Data fetching hooks
  const { entities: cities, getAllByCountry: loadCitiesByCountry } = useCities();
  const { entities: regions, getAllByCity: loadRegionsByCity } = useRegions();
  const { entities: universities, getAll: loadUniversities } = useEntityCrud<University>('/shared-kernal/universities', '/shared-kernal/universities');
  const { entities: faculties, getAllByUniversity: loadFacultiesByUniversity } = useFaculties();
  const { entities: specializations, getAllByFaculty: loadSpecializationsByFaculty } = useSpecializations();
  const { entities: orgUnits, getAll: loadOrgUnits } = useEntityCrud<OrganizationalLevels>('/hr/organizational-levels', '/hr/organizational-levels');
  const { entities: jobStatus, getAll: loadJobStatus, error } = useEntityCrud<JobStatus>('/hr/job-statuses', '/hr/job-statuses');

  // Country CRUD (you may need a useCountries hook)


  const { entities: countries, getAll: loadCountries } = useEntityCrud<Country>('/shared-kernal/countries', '/shared-kernal/countries');
  const { entities: chronicDiseases, getAll: loadChronicDiseases } = useEntityCrud<Country>('/hr/chronic-diseases', '/hr/chronic-diseases');
  const { getAll: loadEmployeeStatuses } = useEntityCrud<EmployeeStatus>('/hr/employee-statuses', '/hr/employee-statuses');

  const computeCountries = async () => {
    const response = await loadCountries();
    return { options: response.data.map((c: any) => ({ value: c.id, label: c.name, is_default: c.is_default })) };
  };
  const computeChronicDiseases = async () => {
    const response = await loadChronicDiseases();
    return { options: response.data.map((c: any) => ({ value: c.id, label: c.name })) };
  };

  const computeEmployeeStatuses = async () => {
    const response = await loadEmployeeStatuses();
    return { options: response.data.map((es: any) => ({ value: es.id, label: es.name, is_default: es.is_default })) };
  };

  // Create form for country (add after other create forms)
  function CountryCreateForm({ onSuccess, onCancel }: { onSuccess: (id: number | string, item: any) => void; onCancel: () => void }) {
    const { create: createCountry } = useEntityCrud<Country>('/shared-kernal/countries', '/shared-kernal/countries');
    return <CreateEntityForm fields={[{ name: 'name', label: t('employees.country', 'hr') || 'اسم الدولة', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'قيمة افتراضية', required: false, type: 'checkbox' }]} defaultValues={{ name: '' }} schema={CountryFormSchema}
      onSubmit={async (data) => {
        const payload = {
          ...data,
          name: {
            ar: data.name
          },

        }
        return await createCountry(payload)
      }} onSuccess={onSuccess} onCancel={onCancel} title={t('employees.country', 'hr') || "دولة"} submitLabel={t('employee_form.add_country', 'hr') || "إضافة دولة جديدة"} />;
  }

  function ChronicDiseaseCreateForm({ onSuccess, onCancel }: { onSuccess: (id: number | string, item: any) => void; onCancel: () => void }) {
    const { create: createChronicDisease } = useEntityCrud<ChronicDiseases>('/hr/chronic-diseases', '/hr/chronic-diseases');
    return <CreateEntityForm
      fields={[{ name: 'name', label: t('employees.chronic_diseases', 'hr') || 'الأمراض المزمنة' }]}
      defaultValues={{ name: '' }}
      schema={EntityFormSchema}
      onSubmit={async (data) => {
        const payload = {
          name: data.name,
          // is_default : data.is_default
        }
        return await createChronicDisease(payload)
      }} onSuccess={onSuccess} onCancel={onCancel}
      title={t('employees.chronic_diseases', 'hr') || 'الأمراض المزمنة'}
      submitLabel={t('employee_form.add_chronic_disease', 'hr') || "إضافة مرض مزمن"}
    />;
  }
  function EmployeeStatusCreateForm({ onSuccess, onCancel }: { onSuccess: (id: number | string, item: any) => void; onCancel: () => void }) {
    const { create: createEmployeeStatus } = useEntityCrud<EmployeeStatus>('/hr/employee-statuses', '/hr/employee-statuses');
    return <CreateEntityForm fields={[{ name: 'name', label: t('employees.employee_status', 'hr') || 'حالة الموظف' }, { name: 'is_default', label: t('common.is_default', 'shared') || 'قيمة افتراضية', required: false, type: 'checkbox' }]} defaultValues={{ name: '' }} schema={EmployeeStatusFormSchema} onSubmit={async (data) => {
      const payload = {
        ...data,
        name: data.name,
        // is_default : data.is_default
      }
      return await createEmployeeStatus(payload)
    }} onSuccess={onSuccess} onCancel={onCancel} title={t('employees.employee_statuses', 'hr') || 'حالات الموظف'}
      submitLabel={t('employee_form.add_employee_status', 'hr') || "إضافة حالة موظف"}
    />;
  }

  // Modify CityCreateForm to accept countryId
  function CityCreateForm({ onSuccess, onCancel, countryId }: { onSuccess: (id: number, item: any) => void; onCancel: () => void; countryId?: number }) {
    const { create: createCity } = useCities(); // assumes createCity can accept country_id
    const schemaWithoutCountry = CityFormSchema.omit({ country_id: true });

    return (
      <GenericCreateForm
        fields={[{ name: 'name', label: t('employees.city', 'hr') || 'اسم المدينة', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'قيمة افتراضية', required: false, type: 'checkbox' }]}
        schema={schemaWithoutCountry}
        defaultValues={{ name: '' }}
        onSubmit={async (data) => {
          const payload = {
            ...data,
            name: {
              ar: data.name
            },
            country_id: countryId
          }
          return await createCity(payload);
        }}
        onSuccess={onSuccess}
        onCancel={onCancel}
        submitLabel={t('employee_form.add_city', 'hr') || "إضافة مدينة"}
      />
    );
  }

  // Modify RegionCreateForm to accept cityId
  function RegionCreateForm({ onSuccess, onCancel, cityId }: { onSuccess: (id: number, item: any) => void; onCancel: () => void; cityId?: number }) {
    const { create: createRegion } = useRegions();
    const schemaWithoutCity = RegionFormSchema.omit({ city_id: true });
    return (
      <GenericCreateForm
        fields={[{ name: 'name', label: t('employees.region', 'hr') || 'اسم المنطقة السكنية', required: true }, { name: 'is_default', label: t('common.is_default', 'shared') || 'قيمة افتراضية', required: false, type: 'checkbox' }]}
        schema={schemaWithoutCity}
        defaultValues={{ city_id: cityId }}
        onSubmit={async (data) => {
          const payload = {
            ...data,
            name: {
              ar: data.name
            },
            city_id: cityId
          }
          return await createRegion(payload);
        }}
        onSuccess={onSuccess}
        onCancel={onCancel}
        submitLabel={t('employee_form.add_region', 'hr') || "إضافة منطقة"}
      />
    );
  }
  // Compute functions
  const computeCities = async (values: any) => {
    const countryId = values.employment_details?.workplace_country_id;
    if (!countryId) return { options: [], disabled: true };
    const response = await loadCitiesByCountry(countryId);
    return { options: response.data.map((c: any) => ({ value: c.id, label: c.name, is_default: c.is_default })) };
  };

  const computeRegions = async (values: any) => {
    const cityId = values.residence_city_id;
    if (!cityId) return { options: [], disabled: true };
    const response = await loadRegionsByCity(cityId);
    return { options: response.data.map((r: any) => ({ value: r.id, label: r.name, is_default: r.is_default })) };
  };

  const computeUniversities = async () => {
    const response = await loadUniversities();
    return { options: response.data.map((u: any) => ({ value: u.id, label: u.name, is_default: u.is_default })) };
  };

  const computeFaculties = async (values: any, idx: number) => {
    const univId = getNestedValue(values, `educations.${idx}.university_id`);
    if (!univId) return { options: [], disabled: true };
    const response = await loadFacultiesByUniversity(Number(univId));
    return { options: response.data.map((f: any) => ({ value: f.id, label: f.name, is_default: f.is_default })) };
  };

  const computeSpecializations = async (values: any, idx: number) => {
    const facId = getNestedValue(values, `educations.${idx}.faculty_id`);
    if (!facId) return { options: [], disabled: true };
    const response = await loadSpecializationsByFaculty(Number(facId));
    return { options: response.data.map((s: any) => ({ value: s.id, label: s.name, is_default: s.is_default })) };
  };

  const addEducation = () => {
    setValue('educations', [
      ...educations,
      {
        category: 'latest',
        degree_name: null,
        university_id: null,
        faculty_id: null,
        specialization_id: null,
        graduation_year: null,
        academic_stage: null,
        study_status: null,
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setValue('educations', educations.filter((_, i) => i !== index));
  };


  type FieldConfig = Omit<FormInputProps<any>, 'name'> & { name: string };

  const PERSONAL_FIELDS: FieldConfig[] = [
    { name: 'internal_id', label: t('employees.internal_id', 'hr') || 'الرقم الداخلي', required: true },
    { name: 'national_id', label: t('employees.national_id', 'hr') || 'الرقم الوطني', required: true },
    { name: 'first_name', label: t('employees.first_name', 'hr') || 'الاسم الأول', required: true },
    { name: 'father_name', label: t('employees.father_name', 'hr') || 'اسم الأب' },
    { name: 'grandfather_name', label: t('employees.grandfather_name', 'hr') || 'اسم الجد' },
    { name: 'last_name', label: t('employees.last_name', 'hr') || 'اسم العائلة', required: true },
    { name: 'mother_name', label: t('employees.mother_name', 'hr') || 'اسم الأم' },
    { name: 'gender', label: t('employees.gender', 'hr') || 'الجنس', type: 'select', options: [{ value: 'male', label: t('employees.gender_male', 'hr') || 'ذكر' }, { value: 'female', label: t('employees.gender_female', 'hr') || 'أنثى' }], required: true },
    { name: 'date_birth', type: 'date', label: t('employees.date_birth', 'hr') || 'تاريخ الميلاد' },
    { name: 'place_birth', label: t('employees.place_birth', 'hr') || 'مكان الميلاد' },
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
      name: 'spouse_name', label: t('employees.spouse_name', 'hr') || 'اسم الزوج/الزوجة',
      dependsOn: ['marital_status']
      ,
      compute: (values) => {
        if (values.marital_status != 'married')
          return { disabled: true }

        return { disabled: false }
      }
    },
    {
      name: 'spouse_workplace', label: t('employees.spouse_workplace', 'hr') || 'جهة عمل الزوج/الزوجة',
      dependsOn: ['marital_status']
      , compute: (values) => {
        if (values.marital_status != 'married')
          return { disabled: true }

        return { disabled: false }
      }
    },
    {
      name: 'number_of_children', label: t('employees.number_of_children', 'hr') || 'عدد الأولاد',
      dependsOn: ['marital_status'],
      compute: (values) => {
        if (values.marital_status != 'married')
          return { disabled: true }

        return { disabled: false }
      },
      type: 'number'
    },
    {
      name: 'children', label: t('employees.children', 'hr') || 'الأولاد',
      dependsOn: ['marital_status', 'number_of_children'],
      compute: (values) => {
        if (values.marital_status != 'married' || values.number_of_children <= 0)
          return { disabled: true }

        return { disabled: false, numberOfRows: values.number_of_children }
      },
      type: 'data-matrix',
      matrixFields: [
        {
          label: t('employees.child_name', 'hr') || 'عدد الأولاد',
          name: "name",
          type: "text"
        },
        {
          label: t('employees.date_birth', 'hr') || 'تاريخ الميلاد',
          name: "birthdate",
          type: "date",
          required: true
        },
      ],
      rowSchema: z.object({
        name: z.string().min(1, t('employee_form.validation.name_invalid', 'hr') || 'اسم الابن مطلوب').nullable(),
        birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t('employee_form.validation.birthdate_invalid', 'hr') || 'تاريخ الولادة بصيغة YYYY-MM-DD'),
      })
    },
    { name: 'blood_type', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({ value: v, label: v })), label: t('employees.blood_type', 'hr') || 'فصيلة الدم' },
    { name: 'phone_number', label: t('employees.phone_number', 'hr') || 'رقم الهاتف' },
    { name: 'sham_cash_account', label: t('employees.sham_cash_account', 'hr') || 'حساب الشام كاش' },
    {
      name: 'residence_country_id',
      type: 'select-or-create',
      searchable: true,
      label: t('employees.country', 'hr') || 'الدولة',
      required: true,
      createTitle: t('employee_form.add_country', 'hr') || 'إضافة دولة جديدة',
      labelPath: 'data.name',
      renderCreateForm: (onSuccess, onCancel) => <CountryCreateForm onSuccess={(v, i) => {
        onSuccess(v, i)
      }} onCancel={onCancel} />,
      compute: computeCountries,
    },
    {
      name: 'residence_city_id',
      type: 'select-or-create',
      searchable: true,
      label: t('employees.city', 'hr') || 'المدينة',
      required: true,
      dependsOn: ['residence_country_id'],
      compute: async (values) => {
        const countryId = values.residence_country_id;
        if (!countryId) return { options: [], disabled: true };
        const response = await loadCitiesByCountry(countryId);
        return { options: response.data.map((c: any) => ({ value: c.id, label: c.name, is_default: c.is_default })) };
      },
      createTitle: t('employee_form.add_city', 'hr') || 'إضافة مدينة جديدة',
      labelPath: 'data.name',

      renderCreateForm: (onSuccess, onCancel, deps) => (
        <CityCreateForm countryId={deps?.residence_country_id as number} onSuccess={onSuccess} onCancel={onCancel} />
      ),
    },
    {
      name: 'residence_region_id',
      type: 'select-or-create',
      searchable: true,
      label: t('employees.region', 'hr') || 'منطقة السكن',
      required: true,
      dependsOn: ['residence_city_id'],
      compute: async (values) => {
        const cityId = values.residence_city_id;
        if (!cityId) return { options: [], disabled: true };
        const response = await loadRegionsByCity(cityId);
        return { options: response.data.map((r: any) => ({ value: r.id, label: r.name, is_default: r.is_default })) };
      },
      createTitle: t('employee_form.add_region', 'hr') || 'إضافة منطقة جديدة',
      labelPath: 'data.name',

      renderCreateForm: (onSuccess, onCancel, deps) => (
        <RegionCreateForm cityId={deps?.residence_city_id as number} onSuccess={onSuccess} onCancel={onCancel} />
      ),
    },
    { name: 'residential_area_details', label: t('employees.residential_area_details', 'hr') || 'تفاصيل المنطقة السكنية' },
    { name: 'civil_registry_record', label: t('employees.civil_registry_record', 'hr') || 'رقم القيد المدني' },
    { name: 'health_status', label: t('employees.health_status', 'hr') || 'الحالة الصحية' },
    { name: 'injury_details', label: t('employees.injury_details', 'hr') || 'تفاصيل الإصابات' },
    { name: 'injury_date', type: 'date', label: t('employees.injury_date', 'hr') || 'تاريخ الإصابة' },
    {
      name: 'chronic_disease_ids', type: 'multi-select-or-create', searchable: true, label: t('employees.chronic_diseases', 'hr') || 'تاريخ الإصابة',
      labelPath: 'data.name',
      renderCreateForm: (onSuccess, onCancel) => <ChronicDiseaseCreateForm onSuccess={(v, i) => {
        onSuccess(v, i)
      }} onCancel={onCancel} />,
      compute: computeChronicDiseases,
    },
    {
      name: 'employee_status_id', type: 'select-or-create', searchable: true, label: t('employees.employee_status_id', 'hr') || 'Employee Status',
      labelPath: 'data.name',
      infoButton:employee_id ? () => { setStatusLogsOpen(true) } : undefined,
      renderCreateForm: (onSuccess, onCancel) => <EmployeeStatusCreateForm onSuccess={(v, i) => {
        onSuccess(v, i)
      }} onCancel={onCancel} />,
      required: true,
      compute: computeEmployeeStatuses,
    },
    {
      name: 'employee_status_note', type: 'text', label: t('employees.employee_status_note', 'hr') || 'ملاحظة حالة الموظف', required: true, dependsOn: ['employee_status_id'], compute: async (values) => {
        if (!values.employee_status_id) {
          return ({ disabled: true })
        }
        else {
          return ({ disabled: false })
        }
      }
    }

  ];

  const EMPLOYMENT_FIELDS: FieldConfig[] = [
    { name: 'employment_details.job_title', label: t('employees.job_title', 'hr') || 'المسمى الوظيفي' },
    { name: 'assigned_job', label: t('employees.assigned_job', 'hr') || 'العمل المكلف به', required: true },
    {
      name: 'employment_details.status',
      type: 'select',
      label: t('employees.status', 'hr') || 'حالة الموظف',
      options: [
        { value: 'active', label: t('show_employee.status_active', 'hr') || 'نشط' },
        { value: 'inactive', label: t('show_employee.status_inactive', 'hr') || 'غير نشط' },
        { value: 'terminated', label: t('show_employee.status_terminated', 'hr') || 'منتهي' },
        { value: 'on_leave', label: t('show_employee.status_on_leave', 'hr') || 'في إجازة' },
      ],
      required: true,
    },
    { name: 'employment_details.appointment_date', type: 'date', label: t('employees.appointment_date', 'hr') || 'تاريخ التعيين' },
    {
      name: 'employment_details.contract_type',
      label: t('employees.contract_type', 'hr') || 'نوع العقد',
      type: 'select',
      options: [
        { value: 'full-time', label: t('show_employee.contract_full_time', 'hr') || 'دوام كامل' },
        { value: 'part-time', label: t('show_employee.contract_part_time', 'hr') || 'دوام جزئي' },
        { value: 'temporary', label: t('show_employee.contract_temporary', 'hr') || 'مؤقت' },
        { value: 'contract', label: t('show_employee.contract_contract', 'hr') || 'عقد' },
      ],
    },
    {
      name: 'employment_details.contract_nature',
      label: t('employees.contract_nature', 'hr') || 'طبيعة العقد',
      type: 'select',
      options: [
        { value: 'permanent', label: t('show_employee.nature_permanent', 'hr') || 'دائم' },
        { value: 'temporary', label: t('show_employee.nature_temporary', 'hr') || 'مؤقت' },
        { value: 'internship', label: t('show_employee.nature_internship', 'hr') || 'تدريب' },
      ],
    },
    { name: 'employment_details.job_category', label: t('employees.job_category', 'hr') || 'التصنيف الوظيفي' },
    {
      name: 'job_status_id', label: t('employees.job_status', 'hr') || 'الحالة الوظيفية',
      required: true,
      searchable: true,
      labelPath: 'data.name',
      type: 'select-or-create',
      infoButton:employee_id ? () => { setJobStatusLogsOpen(true) } : undefined,
      renderCreateForm: (onSuccess, onCancel) => <JobStatusCreateForm onSuccess={onSuccess} onCancel={onCancel} />,
      compute: async (values) => {
        const response = await loadJobStatus();
        return { options: response.data.map((j: any) => ({ value: j.id, label: j.name, is_default: j.is_default })) }
      }
    },
    {
      name: 'job_status_note', label: t('employees.job_status_note', 'hr') || 'ملاحظات الحالة الوظيفية', dependsOn: ['job_status_id'], required: true, compute: async (values) => {
        if (!values.job_status_id) {
          return ({ disabled: true })
        }
        else {
          return ({ disabled: false })
        }
      }
    },
    {
      name: 'employment_details.workplace_city_id',
      type: 'select-or-create',
      searchable: true,
      label: t('employees.workplace_city', 'hr') || 'مدينة العمل',
      required: true,
      createTitle: t('employee_form.add_city', 'hr') || 'إضافة مدينة جديدة',
      dependsOn: ['residence_country_id'],
      compute: async (values) => {
        const countryId = values.residence_country_id;
        if (!countryId) return { options: [], disabled: true };
        const response = await loadCitiesByCountry(countryId);
        return { options: response.data.map((c: any) => ({ value: c.id, label: c.name, is_default: c.is_default })) }
      },
      labelPath: 'data.name',

      renderCreateForm: (onSuccess, onCancel) => <CityCreateForm onSuccess={onSuccess} onCancel={onCancel} />,
    },
  ];
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns] || 'grid-cols-2';

  const fullWidthClass = columns === 1 ? 'col-span-1' : `col-span-${columns}`;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(async (data) => {
        try {
          await onSubmit(data)
          methods.reset(data)
        } catch (err: any) {
          if (err.validationErrors) {
            const entries = Object.entries(err.validationErrors)
            entries.forEach(([field, msgs]) => {
              const msg = Array.isArray(msgs) ? msgs[0] : String(msgs)
              methods.setError(field as any, { message: msg })
            })
            const firstField = entries[0][0]
            const el = document.querySelector(`[for="${firstField}"]`)
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
          }
          throw err
        }
      })} className="space-y-6">
        {/* Personal Section */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="text-lg font-bold mb-4">{t('show_employee.personal_info', 'hr') || 'المعلومات الشخصية'}</h3>
          <div className={`grid ${gridColsClass} gap-4`}>
            {PERSONAL_FIELDS.map((field) => (
              <FormInput key={field.name} {...field} />
            ))}
          </div>
        </div>

        {/* Employment Section */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="text-lg font-bold mb-4">{t('show_employee.employment_details', 'hr') || 'المعلومات الوظيفية'}</h3>
          <div className={`grid ${gridColsClass} gap-4`}>
            {EMPLOYMENT_FIELDS.filter(f => f.name !== 'employment_details.org_unit_id').map((field) => {
              return (
                <FormInput key={field.name} {...field} />
              )
            })}
            {/* Custom organizational unit tree select */}
            <div className={`md:col-span-${columns}`}>
              <OrganizationalUnitTreeSelect
                value={methods.watch('employment_details.org_unit_id')}
                onChange={(val) => {
                  methods.setValue('employment_details.org_unit_id', val ?? 0, { shouldValidate: true, shouldDirty: true });
                }}
                label={t('employees.org_unit_id', 'hr') || 'الوحدة التنظيمية'}
                required
                error={methods.formState.errors.employment_details?.org_unit_id?.message}
              />
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="text-lg font-bold mb-4">{t('show_employee.education_details', 'hr') || 'المؤهلات العلمية'}</h3>
          <div className="space-y-4">
            {educations.map((_, idx) => (
              <div key={idx} className="border border-border rounded p-4 relative">
                <button type="button" onClick={() => removeEducation(idx)} className="absolute top-2 left-2 text-danger text-sm">
                  {t('employee_form.delete', 'hr') || 'حذف'}
                </button>
                <div className={`grid ${gridColsClass} gap-4`}>
                  <FormInput
                    name={`educations.${idx}.category`}
                    type="select"
                    required
                    options={[
                      { value: 'initial', label: t('show_employee.edu_category_initial', 'hr') || 'أولي' },
                      { value: 'adjusted', label: t('show_employee.edu_category_adjusted', 'hr') || 'معدل' },
                      { value: 'latest', label: t('show_employee.edu_category_latest', 'hr') || 'أحدث' },
                      { value: 'current', label: t('show_employee.edu_category_current', 'hr') || 'حالي' },
                    ]}
                    label={t('employee_form.category', 'hr') || 'التصنيف'}
                  />
                  <FormInput name={`educations.${idx}.degree_name`} label={t('employees.degree_name', 'hr') || "اسم الشهادة"} />
                  <FormInput
                    name={`educations.${idx}.university_id`}
                    type="select-or-create"
                    searchable
                    label={t('employees.university', 'hr') || "الجامعة"}
                    createTitle={t('employee_form.add_university', 'hr') || "إضافة جامعة جديدة"}
                    compute={computeUniversities}
                    labelPath='data.name'
                    renderCreateForm={(onSuccess, onCancel) => (
                      <UniversityCreateForm onSuccess={onSuccess} onCancel={onCancel} />
                    )}
                  />
                  <FormInput
                    name={`educations.${idx}.faculty_id`}
                    type="select-or-create"
                    searchable
                    labelPath='data.name'

                    label={t('employees.faculty', 'hr') || "الكلية"}
                    dependsOn={[`educations.${idx}.university_id`]}
                    compute={(values) => computeFaculties(values, idx)}
                    createTitle={t('employee_form.add_faculty', 'hr') || "إضافة كلية جديدة"}
                    renderCreateForm={(onSuccess, onCancel, deps) => {

                      return (
                        <FacultyCreateForm
                          universityId={deps?.[`educations.${idx}.university_id`] as number | undefined}
                          onSuccess={(v, i) => {
                            onSuccess(v, i)
                          }}
                          onCancel={onCancel}
                        />
                      )
                    }}
                  />
                  <FormInput
                    name={`educations.${idx}.specialization_id`}
                    type="select-or-create"
                    searchable

                    label={t('employees.specialization', 'hr') || "التخصص"}
                    dependsOn={[`educations.${idx}.faculty_id`]}
                    compute={(values) => computeSpecializations(values, idx)}
                    createTitle={t('employee_form.add_specialization', 'hr') || "إضافة تخصص جديد"}
                    labelPath='data.name'
                    renderCreateForm={(onSuccess, onCancel, deps) => (
                      <SpecializationCreateForm
                        facultyId={deps?.[`educations.${idx}.faculty_id`] as number | undefined}
                        onSuccess={onSuccess}
                        onCancel={onCancel}
                      />
                    )}
                  />
                  <FormInput name={`educations.${idx}.graduation_year`} label={t('employees.graduation_year', 'hr') || "سنة التخرج"} />
                  <FormInput name={`educations.${idx}.academic_stage`} label={t('employees.academic_stage', 'hr') || "المرحلة الأكاديمية"} />
                  <FormInput name={`educations.${idx}.study_status`} label={t('employees.study_status', 'hr') || "حالة الدراسة"} />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addEducation}>
              + {t('employee_form.add_education', 'hr') || 'إضافة مؤهل علمي'}
            </Button>
          </div>
        </div>
        {employee_id && (
          <EmployeeStatusLogsDialog isOpen={statusLogsOpen} onClose={() => setStatusLogsOpen(false)} employeeId={employee_id} />
        )}
        {employee_id && (
          <JobStatusLogsDialog isOpen={jobStatusLogsOpen} onClose={() => setJobStatusLogsOpen(false)} employeeId={employee_id} />
        )}
        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={() => employee_id ? attemptNavigation(() => onCancel?.()) :onCancel?.() }>
              {actualCancelLabel}
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? (t('employee_form.saving', 'hr') || 'جاري...') : actualSubmitLabel}
          </Button>
        </div>
        <ConfirmDialog
          isOpen={showConfirm}
          title={t('employee_form.unsaved_title', 'hr') || 'Unsaved Changes'}
          message={t('employee_form.unsaved_message', 'hr') || 'You have unsaved changes. Are you sure you want to leave?'}
          type="alert"
          confirmLabel={t('employee_form.unsaved_leave', 'hr') || 'Leave'}
          cancelLabel={t('employee_form.unsaved_stay', 'hr') || 'Stay'}
          onConfirm={confirmNavigation}
          onCancel={cancelNavigation}
        />
      </form>
    </FormProvider>
  );
}