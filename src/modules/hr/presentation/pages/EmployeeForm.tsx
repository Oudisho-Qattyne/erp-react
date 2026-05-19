// src/modules/hr/presentation/components/EmployeeForm.tsx
import React, { useState } from 'react';
import { z } from 'zod';
import { useCities, useEntityCrud, useFaculties, useRegions, useSpecializations } from '../hooks';
import { CityFormSchema } from '../../../../core/presentation/schemas/regions/cityForm.schema';
import { RegionFormSchema } from '../../../../core/presentation/schemas/regions/regionForm.schema';
import type { University } from '../../../../core/domain/entities/education/University';
import { UniversityFormSchema } from '../../../../core/presentation/schemas/education/universityForm.schema';
import { FacultyFormSchema } from '../../../../core/presentation/schemas/education/facultyForm.schema';
import { SpecializationFormSchema } from '../../../../core/presentation/schemas/education/specializationForm.schema';
import type { OrganizationalLevels } from '../../../../core/domain/entities/organizationalLevels/organizationalLevels';
import { organizationalLevelFormSchema } from '../../../../core/presentation/schemas/organizationalLevels/organizationalLevel.Schema';
import { FormInput, type FormInputProps } from '../../../../core/presentation/layouts/ui/inputs/FormInput';
import { CreateEmployeeNestedSchema, type EmployeeFormValues } from '../schemas/employeeForm';
import { useDynamicForm } from '../../../../core/presentation/hooks/useDynamicForm';
import { Button } from '../../../../core/presentation/layouts/ui/buttons/Button';
import { GenericCreateForm } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { FormProvider } from 'react-hook-form';
import type { Country } from '../../../../core/domain/entities/regions/Country';
import { CountryFormSchema } from '../../../../core/presentation/schemas/regions/countryForm.schema';
import { OrganizationalUnitTreeSelect } from '../components/OrganizationalUnitTreeSelect';
import type { CreateEntityDTO } from '../../application/dtos/entityDto';

// -----------------------------------------------------------------------------
// Helper: Generic Create Form wrapper (with explicit types)
// -----------------------------------------------------------------------------
function CreateEntityForm<T>({
  schema,
  onSubmit,
  onSuccess,
  onCancel,
  title,
  defaultValues
}: {
  schema: z.ZodSchema<any>;
  onSubmit: (data: any) => Promise<T>;
  onSuccess: (id: string, item: T) => void;
  onCancel: () => void;
  title: string;
  defaultValues?: Record<string, any>;
}) {
  return (
    <GenericCreateForm
      defaultValues={defaultValues}
      schema={schema}
      onSubmit={async (data: any) => {
        const result = await onSubmit(data);
        onSuccess(String((result as any).id), result);
        return result

      }}
      onSuccess={onSuccess}
      onCancel={onCancel}
      submitLabel={`إضافة ${title}`}
    />
  );
}

function CityCreateForm({ onSuccess, onCancel }: { onSuccess: (id: string, item: any) => void; onCancel: () => void }) {
  const { create: createCity } = useCities();
  return <CreateEntityForm schema={CityFormSchema} onSubmit={createCity} onSuccess={onSuccess} onCancel={onCancel} title="مدينة" />;
}

function RegionCreateForm({ onSuccess, onCancel }: { onSuccess: (id: string, item: any) => void; onCancel: () => void }) {
  const { create: createRegion } = useRegions();
  return <CreateEntityForm schema={RegionFormSchema} onSubmit={createRegion} onSuccess={onSuccess} onCancel={onCancel} title="منطقة" />;
}

function UniversityCreateForm({ onSuccess, onCancel }: { onSuccess: (id: string, item: any) => void; onCancel: () => void }) {
  const { create: createUniversity } = useEntityCrud<University>('', '');
  return <CreateEntityForm defaultValues={{name:""}} schema={UniversityFormSchema} onSubmit={(data) => {
    const payload = {
      name: {
        ar: data.name
      }
    }
    return createUniversity(payload)

  }} onSuccess={onSuccess} onCancel={onCancel} title="جامعة" />;
}

function FacultyCreateForm({ onSuccess, onCancel, universityId }: { onSuccess: (id: string, item: any) => void; onCancel: () => void; universityId?: number }) {
  const { create: createFaculty } = useFaculties();
  const schemaWithUni = FacultyFormSchema.extend({ university_id: z.number().default(universityId ?? 0) });
  return (
    <GenericCreateForm
      schema={schemaWithUni}
      defaultValues={{ university_id: universityId }}
      onSubmit={async (data: any) => {
        const result = await createFaculty(data);
        onSuccess(String(result.id), result);
        return result

      }}
      onSuccess={onSuccess}
      onCancel={onCancel}
      submitLabel="إضافة كلية"
    />
  );
}

function SpecializationCreateForm({ onSuccess, onCancel, facultyId }: { onSuccess: (id: string, item: any) => void; onCancel: () => void; facultyId?: number }) {
  const { create: createSpecialization } = useSpecializations();
  const schemaWithFac = SpecializationFormSchema.extend({ faculty_id: z.number().default(facultyId ?? 0) });
  return (
    <GenericCreateForm
      schema={schemaWithFac}
      defaultValues={{ faculty_id: facultyId }}
      onSubmit={async (data: any) => {
        const result = await createSpecialization(data);
        onSuccess(String(result.id), result);
        return result

      }}
      onSuccess={onSuccess}
      onCancel={onCancel}
      submitLabel="إضافة تخصص"
    />
  );
}

function OrgUnitCreateForm({ onSuccess, onCancel }: { onSuccess: (id: string, item: any) => void; onCancel: () => void }) {
  const { create: createOrgUnit } = useEntityCrud<OrganizationalLevels>('', '');
  return <CreateEntityForm schema={organizationalLevelFormSchema} onSubmit={createOrgUnit} onSuccess={onSuccess} onCancel={onCancel} title="وحدة تنظيمية" />;
}

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
}

export function EmployeeForm({
  defaultValues,
  onSubmit,
  onCancel,
  columns = 2,
  submitLabel = 'حفظ الموظف',
  cancelLabel = 'إلغاء',
  loading = false,
}: EmployeeFormProps) {
  const methods = useDynamicForm({
    schema: CreateEmployeeNestedSchema,
    defaultValues,
    mode: 'onChange',
  });
  const { handleSubmit, formState, watch, setValue } = methods;
  const { isValid, isSubmitting } = formState;

  const educations = watch('educations') || [];

  // Data fetching hooks
  const { entities: cities, getAllByCountry: loadCitiesByCountry } = useCities();
  const { entities: regions, getAllByCity: loadRegionsByCity } = useRegions();
  const { entities: universities, getAll: loadUniversities } = useEntityCrud<University>('', '');
  const { entities: faculties, getAllByUniversity: loadFacultiesByUniversity } = useFaculties();
  const { entities: specializations, getAllByFaculty: loadSpecializationsByFaculty } = useSpecializations();
  const { entities: orgUnits, getAll: loadOrgUnits } = useEntityCrud<OrganizationalLevels>('', '');
  // Country CRUD (you may need a useCountries hook)


  const { entities: countries, getAll: loadCountries } = useEntityCrud<Country>('shared-kernal/countries', 'shared-kernal/countries');

  const computeCountries = async () => {
    const response = await loadCountries();
    return { options: response.data.map((c: any) => ({ value: String(c.id), label: c.name })) };
  };

  // Create form for country (add after other create forms)
  function CountryCreateForm({ onSuccess, onCancel }: { onSuccess: (id: string, item: any) => void; onCancel: () => void }) {
    const { create: createCountry } = useEntityCrud<Country>('shared-kernal/countries', 'shared-kernal/countries');
    return <CreateEntityForm defaultValues={{name:''}} schema={CountryFormSchema} onSubmit={(data) => {
      const payload = {
        name:{
          ar:data.name
        } 
      }
      return createCountry(payload)
    }} onSuccess={onSuccess} onCancel={onCancel} title="دولة" />;
  }

  // Modify CityCreateForm to accept countryId
  function CityCreateForm({ onSuccess, onCancel, countryId }: { onSuccess: (id: string, item: any) => void; onCancel: () => void; countryId?: number }) {
    const { create: createCity } = useCities(); // assumes createCity can accept country_id
    const schemaWithCountry = CityFormSchema.extend({ country_id: z.number().default(countryId ?? 0) });
    return (
      <GenericCreateForm
        schema={schemaWithCountry}
        defaultValues={{ country_id: countryId }}
        onSubmit={async (data) => {
          const result = await createCity(data);
          onSuccess(String(result.id), result);
          return result

        }}
        onSuccess={onSuccess}
        onCancel={onCancel}
        submitLabel="إضافة مدينة"
      />
    );
  }

  // Modify RegionCreateForm to accept cityId
  function RegionCreateForm({ onSuccess, onCancel, cityId }: { onSuccess: (id: string, item: any) => void; onCancel: () => void; cityId?: number }) {
    const { create: createRegion } = useRegions();
    const schemaWithCity = RegionFormSchema.extend({ city_id: z.number().default(cityId ?? 0) });
    return (
      <GenericCreateForm
        schema={schemaWithCity}
        defaultValues={{ city_id: cityId }}
        onSubmit={async (data) => {
          const result = await createRegion(data);
          onSuccess(String(result.id), result);
          return result
        }}
        onSuccess={onSuccess}
        onCancel={onCancel}
        submitLabel="إضافة منطقة"
      />
    );
  }
  // Compute functions
  const computeCities = async (values: any) => {
    const countryId = values.employment_details?.workplace_country_id;
    if (!countryId) return { options: [], disabled: true };
    const response = await loadCitiesByCountry(countryId);
    return { options: response.data.map((c: any) => ({ value: String(c.id), label: c.name })) };
  };

  const computeRegions = async (values: any) => {
    const cityId = values.residence_city_id;
    if (!cityId) return { options: [], disabled: true };
    const response = await loadRegionsByCity(cityId);
    return { options: response.data.map((r: any) => ({ value: String(r.id), label: r.name })) };
  };

  const computeUniversities = async () => {
    const response = await loadUniversities();
    return { options: response.data.map((u: any) => ({ value: String(u.id), label: u.name })) };
  };

  const computeFaculties = async (values: any, idx: number) => {
    const univId = values[`educations.${idx}.university_id`];
    if (!univId) return { options: [], disabled: true };
    const response = await loadFacultiesByUniversity(univId);
    return { options: response.data.map((f: any) => ({ value: String(f.id), label: f.name })) };
  };

  const computeSpecializations = async (values: any, idx: number) => {
    const facId = values[`educations.${idx}.faculty_id`];
    if (!facId) return { options: [], disabled: true };
    const response = await loadSpecializationsByFaculty(facId);
    return { options: response.data.map((s: any) => ({ value: String(s.id), label: s.name })) };
  };

  const addEducation = () => {
    setValue('educations', [
      ...educations,
      {
        category: 'latest',
        degree_name: '',
        university_id: 0,
        faculty_id: 0,
        specialization_id: 0,
        graduation_year: '',
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
    { name: 'internal_id', label: 'الرقم الداخلي', required: true },
    { name: 'national_id', label: 'الرقم الوطني', required: true },
    { name: 'first_name', label: 'الاسم الأول', required: true },
    { name: 'father_name', label: 'اسم الأب', required: true },
    { name: 'last_name', label: 'اسم العائلة', required: true },
    { name: 'mother_name', label: 'اسم الأم', required: true },
    { name: 'gender', label: 'الجنس', type: 'select', options: [{ value: 'male', label: 'ذكر' }, { value: 'female', label: 'أنثى' }], required: true },
    { name: 'date_birth', type: 'date', label: 'تاريخ الميلاد', required: true },
    { name: 'place_birth', label: 'مكان الميلاد', required: true },
    {
      name: 'marital_status',
      label: 'الحالة الاجتماعية',
      type: 'select',
      options: [
        { value: 'single', label: 'أعزب' },
        { value: 'married', label: 'متزوج' },
        { value: 'divorced', label: 'مطلق' },
        { value: 'widowed', label: 'أرمل' },
      ],
      required: true,
    },
    { name: 'spouse_name', label: 'اسم الزوج/الزوجة' },
    { name: 'spouse_workplace', label: 'جهة عمل الزوج/الزوجة' },
    { name: 'blood_type', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((v) => ({ value: v, label: v })), label: 'فصيلة الدم' },
    { name: 'phone_number', label: 'رقم الهاتف', required: true },
    { name: 'sham_cash_account', label: 'حساب الشام كاش' },
    {
      name: 'residence_country_id',
      type: 'select-or-create',
      label: 'الدولة',
      required: true,
      createTitle: 'إضافة دولة جديدة',
      renderCreateForm: (onSuccess, onCancel) => <CountryCreateForm onSuccess={(v , i) => {
        onSuccess(v , i)}} onCancel={onCancel} />,
      compute: computeCountries, // we need to define this
    },
    {
      name: 'residence_city_id',
      type: 'select-or-create',
      label: 'المدينة',
      required: true,
      dependsOn: ['residence_country_id'],
      compute: async (values) => {
        const countryId = values.residence_country_id;
        if (!countryId) return { options: [], disabled: true };
        const response = await loadCitiesByCountry(countryId);
        return { options: response.data.map((c: any) => ({ value: String(c.id), label: c.name })) };
      },
      createTitle: 'إضافة مدينة جديدة',
      renderCreateForm: (onSuccess, onCancel, deps) => (
        <CityCreateForm countryId={deps?.residence_country_id as number} onSuccess={onSuccess} onCancel={onCancel} />
      ),
    },
    {
      name: 'residence_region_id',
      type: 'select-or-create',
      label: 'منطقة السكن',
      required: true,
      dependsOn: ['residence_city_id'],
      compute: async (values) => {
        const cityId = values.residence_city_id;
        if (!cityId) return { options: [], disabled: true };
        const response = await loadRegionsByCity(cityId);
        return { options: response.data.map((r: any) => ({ value: r.id, label: r.name })) };
      },
      createTitle: 'إضافة منطقة جديدة',
      renderCreateForm: (onSuccess, onCancel, deps) => (
        <RegionCreateForm cityId={deps?.residence_city_id as number} onSuccess={onSuccess} onCancel={onCancel} />
      ),
    },
    { name: 'residential_area_details', label: 'تفاصيل المنطقة السكنية' },
    { name: 'civil_registry_record', label: 'رقم القيد المدني' },
    { name: 'health_status', label: 'الحالة الصحية' },
    { name: 'injury_details', label: 'تفاصيل الإصابات' },
    { name: 'injury_date', type: 'date', label: 'تاريخ الإصابة' },
  ];

  const EMPLOYMENT_FIELDS: FieldConfig[] = [
    { name: 'employment_details.job_title', label: 'المسمى الوظيفي', required: true },
    {
      name: 'employment_details.status',
      type: 'select',
      label: 'حالة الموظف',
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'inactive', label: 'غير نشط' },
        { value: 'terminated', label: 'منتهي' },
        { value: 'on_leave', label: 'في إجازة' },
      ],
      required: true,
    },
    { name: 'employment_details.appointment_date', type: 'date', label: 'تاريخ التعيين', required: true },
    {
      name: 'employment_details.contract_type',
      label: 'نوع العقد',
      type: 'select',
      options: [
        { value: 'full-time', label: 'دوام كامل' },
        { value: 'part-time', label: 'دوام جزئي' },
        { value: 'temporary', label: 'مؤقت' },
        { value: 'contract', label: 'عقد' },
      ],
      required: true,
    },
    {
      name: 'employment_details.contract_nature',
      label: 'طبيعة العقد',
      type: 'select',
      options: [
        { value: 'permanent', label: 'دائم' },
        { value: 'temporary', label: 'مؤقت' },
        { value: 'internship', label: 'تدريب' },
      ],
      required: true,
    },
    { name: 'employment_details.job_category', label: 'التصنيف الوظيفي', required: true },
    {
      name: 'employment_details.workplace_city_id',
      type: 'select-or-create',
      label: 'مدينة العمل',
      required: true,
      createTitle: 'إضافة مدينة جديدة',
      renderCreateForm: (onSuccess, onCancel) => <CityCreateForm onSuccess={onSuccess} onCancel={onCancel} />,
    },
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">

        {/* <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> */}
        {/* Personal Section */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="text-lg font-bold mb-4">المعلومات الشخصية</h3>
          <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
            {PERSONAL_FIELDS.map((field) => (
              <FormInput key={field.name} {...field} />
            ))}
          </div>
        </div>

        {/* Employment Section */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="text-lg font-bold mb-4">المعلومات الوظيفية</h3>
          <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
            {EMPLOYMENT_FIELDS.filter(f => f.name !== 'employment_details.org_unit_id').map((field) => (
              <FormInput key={field.name} {...field} />
            ))}
            {/* Custom organizational unit tree select */}
            <div className={`md:col-span-${columns}`}>
              <OrganizationalUnitTreeSelect
                value={methods.watch('employment_details.org_unit_id')}
                onChange={(val) => {
                  if (val !== undefined)
                    methods.setValue('employment_details.org_unit_id', val, { shouldValidate: true, shouldDirty: true });
                }}
                label="الوحدة التنظيمية"
                required
                error={methods.formState.errors.employment_details?.org_unit_id?.message}
              />
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <h3 className="text-lg font-bold mb-4">المؤهلات العلمية</h3>
          <div className="space-y-4">
            {educations.map((_, idx) => (
              <div key={idx} className="border border-border rounded p-4 relative">
                <button type="button" onClick={() => removeEducation(idx)} className="absolute top-2 left-2 text-danger text-sm">
                  حذف
                </button>
                <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
                  <FormInput
                    name={`educations.${idx}.category`}
                    type="select"
                    options={[
                      { value: 'latest', label: 'أحدث' },
                      { value: 'previous', label: 'سابقة' },
                    ]}
                    label="التصنيف"
                  />
                  <FormInput name={`educations.${idx}.degree_name`} label="اسم الشهادة" required />
                  <FormInput
                    name={`educations.${idx}.university_id`}
                    type="select-or-create"
                    label="الجامعة"
                    createTitle="إضافة جامعة جديدة"
                    compute={computeUniversities}
                    renderCreateForm={(onSuccess, onCancel) => (
                      <UniversityCreateForm onSuccess={onSuccess} onCancel={onCancel} />
                    )}
                  />
                  <FormInput
                    name={`educations.${idx}.faculty_id`}
                    type="select-or-create"
                    label="الكلية"
                    dependsOn={[`educations.${idx}.university_id`]}
                    compute={(values) => computeFaculties(values, idx)}
                    createTitle="إضافة كلية جديدة"
                    renderCreateForm={(onSuccess, onCancel, deps) => (
                      <FacultyCreateForm
                        universityId={deps?.[`educations.${idx}.university_id`] as number | undefined}
                        onSuccess={(v , i) => {
                          onSuccess(v , i)}}
                        onCancel={onCancel}
                      />
                    )}
                  />
                  <FormInput
                    name={`educations.${idx}.specialization_id`}
                    type="select-or-create"
                    label="التخصص"
                    dependsOn={[`educations.${idx}.faculty_id`]}
                    compute={(values) => computeSpecializations(values, idx)}
                    createTitle="إضافة تخصص جديد"
                    renderCreateForm={(onSuccess, onCancel, deps) => (
                      <SpecializationCreateForm
                        facultyId={deps?.[`educations.${idx}.faculty_id`] as number | undefined}
                        onSuccess={onSuccess}
                        onCancel={onCancel}
                      />
                    )}
                  />
                  <FormInput name={`educations.${idx}.graduation_year`} label="سنة التخرج" required />
                  <FormInput name={`educations.${idx}.academic_stage`} label="المرحلة الأكاديمية" />
                  <FormInput name={`educations.${idx}.study_status`} label="حالة الدراسة" />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addEducation}>
              + إضافة مؤهل علمي
            </Button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={!isValid || isSubmitting || loading}>
            {isSubmitting || loading ? 'جاري...' : submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}