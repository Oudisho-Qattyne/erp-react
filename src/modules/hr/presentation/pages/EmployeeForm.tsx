// // src/modules/hr/presentation/components/EmployeeForm.tsx
// import React, { useState, useMemo } from 'react';
// import { FormInput } from '@/core/presentation/layouts/ui/inputs/FormInput';
// import { Button } from '@/core/presentation/layouts/ui/buttons/Button';
// import { Dialog } from '@/core/presentation/layouts/ui/dialog/Dialog';
// import { useDynamicForm } from '@/hooks/useDynamicForm';
// import { CreateEmployeeNestedSchema, type EmployeeFormValues } from '../schemas/employeeForm.schema';
// import { useCities, useRegions, useUniversities, useFaculties, useSpecializations, useOrganizationalUnits } from '../hooks';
// import { GenericCreateForm } from '@/core/presentation/layouts/ui/forms/GenericCreateForm';
// import { CityFormSchema, RegionFormSchema, UniversityFormSchema, FacultyFormSchema, SpecializationFormSchema, organizationalLevelFormSchema } from '../schemas';

// // -----------------------------------------------------------------------------
// // Field Configuration Types
// // -----------------------------------------------------------------------------
// interface BaseFieldConfig {
//   name: string;
//   label: string;
//   required?: boolean;
//   type?: 'text' | 'number' | 'date' | 'select' | 'select-or-create';
//   options?: { value: string; label: string }[];
//   createTitle?: string;
//   renderCreateForm?: (onSuccess: (val: string, item: any) => void, onCancel: () => void, deps?: any) => React.ReactNode;
//   dependsOn?: string[];
//   compute?: (values: any) => Promise<any> | any;
//   gridCols?: number; // override default columns
// }

// interface DynamicArrayFieldConfig {
//   name: string;
//   type: 'dynamic-array';
//   label: string;
//   fields: BaseFieldConfig[];
//   addButtonLabel: string;
// }

// type FieldConfig = BaseFieldConfig | DynamicArrayFieldConfig;

// // -----------------------------------------------------------------------------
// // Helper: Create forms (to be used in renderCreateForm)
// // -----------------------------------------------------------------------------
// function CreateEntityForm({ schema, onSubmit, onSuccess, onCancel, title }: any) {
//   return (
//     <GenericCreateForm
//       schema={schema}
//       onSubmit={async (data: any) => {
//         const result = await onSubmit(data);
//         onSuccess(String(result.id), result);
//       }}
//       onSuccess={onSuccess}
//       onCancel={onCancel}
//       submitLabel={`إضافة ${title}`}
//     />
//   );
// }

// function CityCreateForm({ onSuccess, onCancel }: any) {
//   const { createCity } = useCities();
//   return <CreateEntityForm schema={CityFormSchema} onSubmit={createCity} onSuccess={onSuccess} onCancel={onCancel} title="مدينة" />;
// }
// function RegionCreateForm({ onSuccess, onCancel }: any) {
//   const { createRegion } = useRegions();
//   return <CreateEntityForm schema={RegionFormSchema} onSubmit={createRegion} onSuccess={onSuccess} onCancel={onCancel} title="منطقة" />;
// }
// function UniversityCreateForm({ onSuccess, onCancel }: any) {
//   const { createUniversity } = useUniversities();
//   return <CreateEntityForm schema={UniversityFormSchema} onSubmit={createUniversity} onSuccess={onSuccess} onCancel={onCancel} title="جامعة" />;
// }
// function FacultyCreateForm({ onSuccess, onCancel, universityId }: any) {
//   const { createFaculty } = useFaculties();
//   const schemaWithUni = FacultyFormSchema.extend({ university_id: z.number().default(universityId) });
//   return (
//     <GenericCreateForm
//       schema={schemaWithUni}
//       defaultValues={{ university_id: universityId }}
//       onSubmit={async (data) => {
//         const result = await createFaculty(data);
//         onSuccess(String(result.id), result);
//       }}
//       onSuccess={onSuccess}
//       onCancel={onCancel}
//       submitLabel="إضافة كلية"
//     />
//   );
// }
// function SpecializationCreateForm({ onSuccess, onCancel, facultyId }: any) {
//   const { createSpecialization } = useSpecializations();
//   const schemaWithFac = SpecializationFormSchema.extend({ faculty_id: z.number().default(facultyId) });
//   return (
//     <GenericCreateForm
//       schema={schemaWithFac}
//       defaultValues={{ faculty_id: facultyId }}
//       onSubmit={async (data) => {
//         const result = await createSpecialization(data);
//         onSuccess(String(result.id), result);
//       }}
//       onSuccess={onSuccess}
//       onCancel={onCancel}
//       submitLabel="إضافة تخصص"
//     />
//   );
// }
// function OrgUnitCreateForm({ onSuccess, onCancel }: any) {
//   const { createOrgUnit } = useOrganizationalUnits();
//   return <CreateEntityForm schema={organizationalLevelFormSchema} onSubmit={createOrgUnit} onSuccess={onSuccess} onCancel={onCancel} title="وحدة تنظيمية" />;
// }

// // -----------------------------------------------------------------------------
// // Main EmployeeForm Component
// // -----------------------------------------------------------------------------
// export interface EmployeeFormProps {
//   defaultValues?: Partial<EmployeeFormValues>;
//   onSubmit: (data: EmployeeFormValues) => void | Promise<void>;
//   columns?: 1 | 2 | 3 | 4;
//   showInDialog?: boolean;
//   dialogTitle?: string;
//   triggerButton?: React.ReactNode;
//   submitLabel?: string;
//   loading?: boolean;
// }

// export function EmployeeForm({ defaultValues, onSubmit, columns = 2, showInDialog = false, dialogTitle = 'إضافة موظف جديد', triggerButton, submitLabel = 'حفظ الموظف', loading = false }: EmployeeFormProps) {
//   const methods = useDynamicForm({ schema: CreateEmployeeNestedSchema, defaultValues, mode: 'onChange' });
//   const { handleSubmit, formState, watch, setValue } = methods;
//   const { isValid, isSubmitting } = formState;
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   // Data fetching hooks (for compute functions)
//   const { entities: cities, getAllByCountry: loadCitiesByCountry } = useCities();
//   const { entities: regions, getAllByCity: loadRegionsByCity } = useRegions();
//   const { entities: universities, getAll: loadUniversities } = useUniversities();
//   const { entities: faculties, getAllByUniversity: loadFacultiesByUniversity } = useFaculties();
//   const { entities: specializations, getAllByFaculty: loadSpecializationsByFaculty } = useSpecializations();
//   const { entities: orgUnits, getAll: loadOrgUnits } = useOrganizationalUnits();

//   // Compute functions (wired to the above hooks)
//   const computeUniversities = async () => {
//     const res = await loadUniversities();
//     return { options: res.data.map(u => ({ value: String(u.id), label: u.name.ar })) };
//   };
//   const computeCities = async (values: any) => {
//     const countryId = values.employment_details?.workplace_country_id;
//     if (!countryId) return { options: [], disabled: true };
//     const res = await loadCitiesByCountry(countryId);
//     return { options: res.data.map(c => ({ value: String(c.id), label: c.name.ar })) };
//   };
//   const computeRegions = async (values: any) => {
//     const cityId = values.residence_city_id;
//     if (!cityId) return { options: [], disabled: true };
//     const res = await loadRegionsByCity(cityId);
//     return { options: res.data.map(r => ({ value: String(r.id), label: r.name.ar })) };
//   };
//   const computeFaculties = (idx: number) => async (values: any) => {
//     const univId = values[`educations.${idx}.university_id`];
//     if (!univId) return { options: [], disabled: true };
//     const res = await loadFacultiesByUniversity(univId);
//     return { options: res.data.map(f => ({ value: String(f.id), label: f.name.ar })) };
//   };
//   const computeSpecializations = (idx: number) => async (values: any) => {
//     const facId = values[`educations.${idx}.faculty_id`];
//     if (!facId) return { options: [], disabled: true };
//     const res = await loadSpecializationsByFaculty(facId);
//     return { options: res.data.map(s => ({ value: String(s.id), label: s.name.ar })) };
//   };

//   // ---------------------------------------------------------------------------
//   // Field Configuration (single source of truth)
//   // ---------------------------------------------------------------------------
//   const fieldConfigs: FieldConfig[] = [
//     // Personal fields
//     { name: 'internal_id', label: 'الرقم الداخلي', required: true },
//     { name: 'national_id', label: 'الرقم الوطني', required: true },
//     { name: 'first_name', label: 'الاسم الأول', required: true },
//     { name: 'father_name', label: 'اسم الأب', required: true },
//     { name: 'last_name', label: 'اسم العائلة', required: true },
//     { name: 'mother_name', label: 'اسم الأم', required: true },
//     { name: 'gender', type: 'select', options: [{value:'male',label:'ذكر'},{value:'female',label:'أنثى'}], required: true },
//     { name: 'date_birth', type: 'date', label: 'تاريخ الميلاد', required: true },
//     { name: 'place_birth', label: 'مكان الميلاد', required: true },
//     { name: 'marital_status', type: 'select', options: [{value:'single',label:'أعزب'},{value:'married',label:'متزوج'},{value:'divorced',label:'مطلق'},{value:'widowed',label:'أرمل'}], required: true },
//     { name: 'spouse_name', label: 'اسم الزوج/الزوجة' },
//     { name: 'spouse_workplace', label: 'جهة عمل الزوج/الزوجة' },
//     { name: 'blood_type', type: 'select', options: ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(v=>({value:v,label:v})), label: 'فصيلة الدم' },
//     { name: 'phone_number', label: 'رقم الهاتف', required: true },
//     { name: 'sham_cash_account', label: 'حساب الشام كاش' },
//     { name: 'residence_region_id', type: 'select-or-create', label: 'منطقة السكن', required: true, createTitle: 'إضافة منطقة جديدة', renderCreateForm: (onSuccess,onCancel) => <RegionCreateForm onSuccess={onSuccess} onCancel={onCancel} />, dependsOn: ['residence_city_id'], compute: computeRegions },
//     { name: 'residential_area_details', label: 'تفاصيل المنطقة السكنية' },
//     { name: 'civil_registry_record', label: 'رقم القيد المدني' },
//     { name: 'health_status', label: 'الحالة الصحية' },
//     { name: 'injury_details', label: 'تفاصيل الإصابات' },
//     { name: 'injury_date', type: 'date', label: 'تاريخ الإصابة' },
//     // Employment fields
//     { name: 'employment_details.job_title', label: 'المسمى الوظيفي', required: true },
//     { name: 'employment_details.org_unit_id', type: 'select-or-create', label: 'الوحدة التنظيمية', required: true, createTitle: 'إضافة وحدة تنظيمية جديدة', renderCreateForm: (onSuccess,onCancel) => <OrgUnitCreateForm onSuccess={onSuccess} onCancel={onCancel} /> },
//     { name: 'employment_details.status', type: 'select', options: [{value:'active',label:'نشط'},{value:'inactive',label:'غير نشط'},{value:'terminated',label:'منتهي'},{value:'on_leave',label:'في إجازة'}], required: true },
//     { name: 'employment_details.appointment_date', type: 'date', label: 'تاريخ التعيين', required: true },
//     { name: 'employment_details.contract_type', type: 'select', options: [{value:'full-time',label:'دوام كامل'},{value:'part-time',label:'دوام جزئي'},{value:'temporary',label:'مؤقت'},{value:'contract',label:'عقد'}], required: true },
//     { name: 'employment_details.contract_nature', type: 'select', options: [{value:'permanent',label:'دائم'},{value:'temporary',label:'مؤقت'},{value:'internship',label:'تدريب'}], required: true },
//     { name: 'employment_details.job_category', label: 'التصنيف الوظيفي', required: true },
//     { name: 'employment_details.workplace_city_id', type: 'select-or-create', label: 'مدينة العمل', required: true, createTitle: 'إضافة مدينة جديدة', renderCreateForm: (onSuccess,onCancel) => <CityCreateForm onSuccess={onSuccess} onCancel={onCancel} />, dependsOn: ['employment_details.workplace_country_id'], compute: computeCities },
//     // Dynamic array for education
//     { name: 'educations', type: 'dynamic-array', label: 'المؤهلات العلمية', addButtonLabel: '+ إضافة مؤهل علمي',
//       fields: [
//         { name: 'category', type: 'select', options: [{value:'latest',label:'أحدث'},{value:'previous',label:'سابقة'}], label: 'التصنيف' },
//         { name: 'degree_name', label: 'اسم الشهادة', required: true },
//         { name: 'university_id', type: 'select-or-create', label: 'الجامعة', createTitle: 'إضافة جامعة جديدة', renderCreateForm: (onSuccess,onCancel) => <UniversityCreateForm onSuccess={onSuccess} onCancel={onCancel} />, compute: computeUniversities },
//         { name: 'faculty_id', type: 'select-or-create', label: 'الكلية', createTitle: 'إضافة كلية جديدة', dependsOn: ['university_id'], compute: (values) => computeFaculties(0)(values), renderCreateForm: (onSuccess,onCancel,deps) => <FacultyCreateForm universityId={deps?.university_id} onSuccess={onSuccess} onCancel={onCancel} /> },
//         { name: 'specialization_id', type: 'select-or-create', label: 'التخصص', createTitle: 'إضافة تخصص جديد', dependsOn: ['faculty_id'], compute: (values) => computeSpecializations(0)(values), renderCreateForm: (onSuccess,onCancel,deps) => <SpecializationCreateForm facultyId={deps?.faculty_id} onSuccess={onSuccess} onCancel={onCancel} /> },
//         { name: 'graduation_year', label: 'سنة التخرج', required: true },
//         { name: 'academic_stage', label: 'المرحلة الأكاديمية' },
//         { name: 'study_status', label: 'حالة الدراسة' },
//       ]
//     }
//   ];

//   // Helper to render a single field (including dynamic arrays)
//   const renderField = (field: FieldConfig, customGridCols?: number) => {
//     if (field.type === 'dynamic-array') {
//       const arrayField = field as DynamicArrayFieldConfig;
//       const items = watch(field.name) || [];
//       return (
//         <div key={field.name} className="bg-card rounded-lg p-4 border border-border">
//           <h3 className="text-lg font-bold mb-4">{field.label}</h3>
//           <div className="space-y-4">
//             {items.map((_: any, idx: number) => (
//               <div key={idx} className="border border-border rounded p-4 relative">
//                 <button type="button" onClick={() => setValue(field.name, items.filter((_: any, i: number) => i !== idx))} className="absolute top-2 left-2 text-danger text-sm">حذف</button>
//                 <div className={`grid grid-cols-1 md:grid-cols-${customGridCols || columns} gap-4`}>
//                   {arrayField.fields.map(subField => (
//                     <FormInput
//                       key={`${idx}.${subField.name}`}
//                       name={`${field.name}.${idx}.${subField.name}`}
//                       {...subField}
//                       // Special handling for compute that uses index
//                       compute={subField.compute && typeof subField.compute === 'function' && subField.dependsOn ? (values) => {
//                         const dynamicCompute = subField.compute as any;
//                         return dynamicCompute(values, idx);
//                       } : subField.compute}
//                     />
//                   ))}
//                 </div>
//               </div>
//             ))}
//             <Button type="button" variant="outline" onClick={() => setValue(field.name, [...items, {}])}>{arrayField.addButtonLabel}</Button>
//           </div>
//         </div>
//       );
//     }
//     return <FormInput key={field.name} name={field.name} {...field} />;
//   };

//   // Group fields into sections (optional, but we'll keep sections by type)
//   const personalFields = fieldConfigs.filter(f => !f.name.includes('.') && f.name !== 'educations');
//   const employmentFields = fieldConfigs.filter(f => f.name.startsWith('employment_details.'));
//   const dynamicField = fieldConfigs.find(f => f.type === 'dynamic-array');

//   const formContent = (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//       <div className="bg-card rounded-lg p-4 border border-border">
//         <h3 className="text-lg font-bold mb-4">المعلومات الشخصية</h3>
//         <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>{personalFields.map(f => renderField(f, columns))}</div>
//       </div>
//       <div className="bg-card rounded-lg p-4 border border-border">
//         <h3 className="text-lg font-bold mb-4">المعلومات الوظيفية</h3>
//         <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>{employmentFields.map(f => renderField(f, columns))}</div>
//       </div>
//       {dynamicField && renderField(dynamicField, columns)}
//       <div className="flex justify-end gap-3">
//         <Button type="submit" variant="primary" disabled={!isValid || isSubmitting || loading}>
//           {isSubmitting || loading ? 'جاري...' : submitLabel}
//         </Button>
//       </div>
//     </form>
//   );

//   if (showInDialog) {
//     return (
//       <>
//         <div onClick={() => setIsDialogOpen(true)}>{triggerButton}</div>
//         <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={dialogTitle} size="lg">{formContent}</Dialog>
//       </>
//     );
//   }
//   return <div className="container mx-auto py-6">{formContent}</div>;
// }




// src/modules/hr/presentation/components/EmployeeForm.tsx
import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { FormInput } from '@/core/presentation/layouts/ui/inputs/FormInput';
import { Button } from '@/core/presentation/layouts/ui/buttons/Button';
import { Dialog } from '@/core/presentation/layouts/ui/dialog/Dialog';
import { GenericCreateForm } from '@/core/presentation/layouts/ui/forms/GenericCreateForm';
import { useDynamicForm } from '@/hooks/useDynamicForm';
import { useLanguage } from '@/core/presentation/context/i18n/I18nProvider';
import { CreateEmployeeNestedSchema, type EmployeeFormValues } from '../schemas/employeeForm.schema';
import { useCities } from '@/modules/geography/presentation/hooks/useCities';
import { useRegions } from '@/modules/geography/presentation/hooks/useRegions';
import { useFaculties } from '@/modules/education/presentation/hooks/useFaculties';
import { useSpecializations } from '@/modules/education/presentation/hooks/useSpecializations';
import { useOrganizationalUnits } from '@/modules/hr/presentation/hooks/useOrganizationalUnits';
import { useUniversities } from '@/modules/education/presentation/hooks/useUniversities';
import { CountryFormSchema } from '@/modules/geography/presentation/schemas/countryForm.schema';
import { CityFormSchema } from '@/modules/geography/presentation/schemas/cityForm.schema';
import { RegionFormSchema } from '@/modules/geography/presentation/schemas/regionForm.schema';
import { UniversityFormSchema } from '@/modules/education/presentation/schemas/universityForm.schema';
import { FacultyFormSchema } from '@/modules/education/presentation/schemas/facultyForm.schema';
import z from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Predefined field configurations (static)
// ─────────────────────────────────────────────────────────────────────────────
const PERSONAL_FIELDS = [
  { name: 'internal_id', label: 'الرقم الداخلي', required: true },
  { name: 'national_id', label: 'الرقم الوطني', required: true },
  { name: 'first_name', label: 'الاسم الأول', required: true },
  { name: 'father_name', label: 'اسم الأب', required: true },
  { name: 'last_name', label: 'اسم العائلة', required: true },
  { name: 'mother_name', label: 'اسم الأم', required: true },
  { name: 'gender', type: 'select', options: [{value:'male',label:'ذكر'},{value:'female',label:'أنثى'}], required: true },
  { name: 'date_birth', type: 'date', label: 'تاريخ الميلاد', required: true },
  { name: 'place_birth', label: 'مكان الميلاد', required: true },
  { name: 'marital_status', type: 'select', options: [
    {value:'single',label:'أعزب'},{value:'married',label:'متزوج'},
    {value:'divorced',label:'مطلق'},{value:'widowed',label:'أرمل'}
  ], required: true },
  { name: 'spouse_name', label: 'اسم الزوج/الزوجة' },
  { name: 'spouse_workplace', label: 'جهة عمل الزوج/الزوجة' },
  { name: 'blood_type', type: 'select', options: ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(v=>({value:v,label:v})), label: 'فصيلة الدم' },
  { name: 'phone_number', label: 'رقم الهاتف', required: true },
  { name: 'sham_cash_account', label: 'حساب الشام كاش' },
  { name: 'residence_region_id', type: 'select-or-create', label: 'منطقة السكن', required: true, 
    createTitle: 'إضافة منطقة جديدة', renderCreateForm: (onSuccess, onCancel) => <RegionCreateForm onSuccess={onSuccess} onCancel={onCancel} /> },
  { name: 'residential_area_details', label: 'تفاصيل المنطقة السكنية' },
  { name: 'civil_registry_record', label: 'رقم القيد المدني' },
  { name: 'health_status', label: 'الحالة الصحية' },
  { name: 'injury_details', label: 'تفاصيل الإصابات' },
  { name: 'injury_date', type: 'date', label: 'تاريخ الإصابة' },
];

const EMPLOYMENT_FIELDS = [
  { name: 'employment_details.job_title', label: 'المسمى الوظيفي', required: true },
  { name: 'employment_details.org_unit_id', type: 'select-or-create', label: 'الوحدة التنظيمية', required: true,
    createTitle: 'إضافة وحدة تنظيمية جديدة', renderCreateForm: (onSuccess, onCancel) => <OrgUnitCreateForm onSuccess={onSuccess} onCancel={onCancel} /> },
  { name: 'employment_details.status', type: 'select', options: [
    {value:'active',label:'نشط'},{value:'inactive',label:'غير نشط'},
    {value:'terminated',label:'منتهي'},{value:'on_leave',label:'في إجازة'}
  ], required: true },
  { name: 'employment_details.appointment_date', type: 'date', label: 'تاريخ التعيين', required: true },
  { name: 'employment_details.contract_type', type: 'select', options: [
    {value:'full-time',label:'دوام كامل'},{value:'part-time',label:'دوام جزئي'},
    {value:'temporary',label:'مؤقت'},{value:'contract',label:'عقد'}
  ], required: true },
  { name: 'employment_details.contract_nature', type: 'select', options: [
    {value:'permanent',label:'دائم'},{value:'temporary',label:'مؤقت'},{value:'internship',label:'تدريب'}
  ], required: true },
  { name: 'employment_details.job_category', label: 'التصنيف الوظيفي', required: true },
  { name: 'employment_details.workplace_city_id', type: 'select-or-create', label: 'مدينة العمل', required: true,
    createTitle: 'إضافة مدينة جديدة', renderCreateForm: (onSuccess, onCancel) => <CityCreateForm onSuccess={onSuccess} onCancel={onCancel} /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Generic Create Form wrapper (to avoid repetition)
// ─────────────────────────────────────────────────────────────────────────────
function CreateEntityForm({ schema, onSubmit, onSuccess, onCancel, title }: any) {
  return (
    <GenericCreateForm
      schema={schema}
      onSubmit={async (data: any) => {
        const result = await onSubmit(data);
        onSuccess(String(result.id), result);
      }}
      onSuccess={onSuccess}
      onCancel={onCancel}
      submitLabel={`إضافة ${title}`}
    />
  );
}

function CityCreateForm({ onSuccess, onCancel }: any) {
  const { createCity } = useCities(); // assumes useCities returns create method
  return <CreateEntityForm schema={CityFormSchema} onSubmit={createCity} onSuccess={onSuccess} onCancel={onCancel} title="مدينة" />;
}

function RegionCreateForm({ onSuccess, onCancel }: any) {
  const { createRegion } = useRegions();
  return <CreateEntityForm schema={RegionFormSchema} onSubmit={createRegion} onSuccess={onSuccess} onCancel={onCancel} title="منطقة" />;
}

function UniversityCreateForm({ onSuccess, onCancel }: any) {
  const { createUniversity } = useUniversities();
  return <CreateEntityForm schema={UniversityFormSchema} onSubmit={createUniversity} onSuccess={onSuccess} onCancel={onCancel} title="جامعة" />;
}

function FacultyCreateForm({ onSuccess, onCancel, universityId }: any) {
  const { createFaculty } = useFaculties();
  // Extend schema to include university_id (must be passed)
  const schemaWithUni = FacultyFormSchema.extend({ university_id: z.number().default(universityId) });
  return (
    <GenericCreateForm
      schema={schemaWithUni}
      defaultValues={{ university_id: universityId }}
      onSubmit={async (data) => {
        const result = await createFaculty(data);
        onSuccess(String(result.id), result);
      }}
      onSuccess={onSuccess}
      onCancel={onCancel}
      submitLabel="إضافة كلية"
    />
  );
}

function SpecializationCreateForm({ onSuccess, onCancel, facultyId }: any) {
  const { createSpecialization } = useSpecializations();
  const schemaWithFac = SpecializationFormSchema.extend({ faculty_id: z.number().default(facultyId) });
  return (
    <GenericCreateForm
      schema={schemaWithFac}
      defaultValues={{ faculty_id: facultyId }}
      onSubmit={async (data) => {
        const result = await createSpecialization(data);
        onSuccess(String(result.id), result);
      }}
      onSuccess={onSuccess}
      onCancel={onCancel}
      submitLabel="إضافة تخصص"
    />
  );
}

function OrgUnitCreateForm({ onSuccess, onCancel }: any) {
  const { createOrgUnit } = useOrganizationalUnits();
  return <CreateEntityForm schema={organizationalLevelFormSchema} onSubmit={createOrgUnit} onSuccess={onSuccess} onCancel={onCancel} title="وحدة تنظيمية" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main EmployeeForm Component
// ─────────────────────────────────────────────────────────────────────────────
export interface EmployeeFormProps {
  defaultValues?: Partial<EmployeeFormValues>;
  onSubmit: (data: EmployeeFormValues) => void | Promise<void>;
  columns?: 1 | 2 | 3 | 4;
  showInDialog?: boolean;
  dialogTitle?: string;
  triggerButton?: React.ReactNode;
  submitLabel?: string;
  loading?: boolean;
}

export function EmployeeForm({
  defaultValues,
  onSubmit,
  columns = 2,
  showInDialog = false,
  dialogTitle = 'إضافة موظف جديد',
  triggerButton,
  submitLabel = 'حفظ الموظف',
  loading = false,
}: EmployeeFormProps) {
  const methods = useDynamicForm({
    schema: CreateEmployeeNestedSchema,
    defaultValues,
    mode: 'onChange',
  });
  const { handleSubmit, formState, watch, setValue } = methods;
  const { isValid, isSubmitting } = formState;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const educations = watch('educations') || [];

  // ─────────────────────────────────────────────────────────────────────────────
  // Hooks for loading options (using the provided nested hooks)
  // ─────────────────────────────────────────────────────────────────────────────
  const { entities: cities, getAllByCountry: loadCitiesByCountry } = useCities();
  const { entities: regions, getAllByCity: loadRegionsByCity } = useRegions();
  const { entities: universities, getAll: loadUniversities } = useUniversities();
  const { entities: faculties, getAllByUniversity: loadFacultiesByUniversity } = useFaculties();
  const { entities: specializations, getAllByFaculty: loadSpecializationsByFaculty } = useSpecializations();
  const { entities: orgUnits, getAll: loadOrgUnits } = useOrganizationalUnits();

  // ─────────────────────────────────────────────────────────────────────────────
  // Dynamic options for select‑or‑create fields (via compute)
  // ─────────────────────────────────────────────────────────────────────────────
  const computeCities = async (values: any) => {
    const countryId = values.employment_details?.workplace_country_id;
    if (!countryId) return { options: [], disabled: true };
    const response = await loadCitiesByCountry(countryId);
    return { options: response.data.map(c => ({ value: String(c.id), label: c.name.ar })) };
  };

  const computeRegions = async (values: any) => {
    const cityId = values.residence_city_id;
    if (!cityId) return { options: [], disabled: true };
    const response = await loadRegionsByCity(cityId);
    return { options: response.data.map(r => ({ value: String(r.id), label: r.name.ar })) };
  };

  const computeUniversities = async () => {
    const response = await loadUniversities();
    return { options: response.data.map(u => ({ value: String(u.id), label: u.name.ar })) };
  };

  const computeFaculties = async (values: any, idx: number) => {
    const univId = values[`educations.${idx}.university_id`];
    if (!univId) return { options: [], disabled: true };
    const response = await loadFacultiesByUniversity(univId);
    return { options: response.data.map(f => ({ value: String(f.id), label: f.name.ar })) };
  };

  const computeSpecializations = async (values: any, idx: number) => {
    const facId = values[`educations.${idx}.faculty_id`];
    if (!facId) return { options: [], disabled: true };
    const response = await loadSpecializationsByFaculty(facId);
    return { options: response.data.map(s => ({ value: String(s.id), label: s.name.ar })) };
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Education helpers
  // ─────────────────────────────────────────────────────────────────────────────
  const addEducation = () => {
    setValue('educations', [
      ...educations,
      { category: 'latest', degree_name: '', university_id: 0, faculty_id: 0, specialization_id: 0, graduation_year: '', academic_stage: null, study_status: null },
    ]);
  };

  const removeEducation = (index: number) => {
    setValue('educations', educations.filter((_, i) => i !== index));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Form content
  // ─────────────────────────────────────────────────────────────────────────────
  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Section */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h3 className="text-lg font-bold mb-4">المعلومات الشخصية</h3>
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
          {PERSONAL_FIELDS.map((field) => (
            <FormInput key={field.name} name={field.name as any} {...field} />
          ))}
        </div>
      </div>

      {/* Employment Section */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h3 className="text-lg font-bold mb-4">المعلومات الوظيفية</h3>
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
          {EMPLOYMENT_FIELDS.map((field) => (
            <FormInput key={field.name} name={field.name as any} {...field} />
          ))}
        </div>
      </div>

      {/* Education Section (Dynamic) */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h3 className="text-lg font-bold mb-4">المؤهلات العلمية</h3>
        <div className="space-y-4">
          {educations.map((_, idx) => (
            <div key={idx} className="border border-border rounded p-4 relative">
              <button type="button" onClick={() => removeEducation(idx)} className="absolute top-2 left-2 text-danger text-sm">حذف</button>
              <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
                <FormInput name={`educations.${idx}.category`} type="select" options={[{value:'latest',label:'أحدث'},{value:'previous',label:'سابقة'}]} label="التصنيف" />
                <FormInput name={`educations.${idx}.degree_name`} label="اسم الشهادة" required />
                <FormInput name={`educations.${idx}.university_id`} type="select-or-create" label="الجامعة" createTitle="إضافة جامعة جديدة"
                  compute={computeUniversities} renderCreateForm={(onSuccess, onCancel) => <UniversityCreateForm onSuccess={onSuccess} onCancel={onCancel} />} />
                <FormInput name={`educations.${idx}.faculty_id`} type="select-or-create" label="الكلية" dependsOn={[`educations.${idx}.university_id`]}
                  compute={(values) => computeFaculties(values, idx)} createTitle="إضافة كلية جديدة"
                  renderCreateForm={(onSuccess, onCancel, deps) => <FacultyCreateForm universityId={deps?.[`educations.${idx}.university_id`]} onSuccess={onSuccess} onCancel={onCancel} />} />
                <FormInput name={`educations.${idx}.specialization_id`} type="select-or-create" label="التخصص" dependsOn={[`educations.${idx}.faculty_id`]}
                  compute={(values) => computeSpecializations(values, idx)} createTitle="إضافة تخصص جديد"
                  renderCreateForm={(onSuccess, onCancel, deps) => <SpecializationCreateForm facultyId={deps?.[`educations.${idx}.faculty_id`]} onSuccess={onSuccess} onCancel={onCancel} />} />
                <FormInput name={`educations.${idx}.graduation_year`} label="سنة التخرج" required />
                <FormInput name={`educations.${idx}.academic_stage`} label="المرحلة الأكاديمية" />
                <FormInput name={`educations.${idx}.study_status`} label="حالة الدراسة" />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addEducation}>+ إضافة مؤهل علمي</Button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" variant="primary" disabled={!isValid || isSubmitting || loading}>
          {isSubmitting || loading ? 'جاري...' : submitLabel}
        </Button>
      </div>
    </form>
  );

  if (showInDialog) {
    return (
      <>
        <div onClick={() => setIsDialogOpen(true)}>{triggerButton}</div>
        <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title={dialogTitle} size="lg">
          {formContent}
        </Dialog>
      </>
    );
  }

  return <div className="container mx-auto py-6">{formContent}</div>;
}