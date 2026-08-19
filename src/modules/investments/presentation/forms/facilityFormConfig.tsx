import type { FieldConfig, GroupConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { GenericCreateForm } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { Facility, ProductionCapacityRow } from '../../domain/entities/facility';
import type { PartnershipType } from '../../domain/entities/partnershipType';
import type { ConsumptionMaterial } from '../../domain/entities/consumptionMaterial';
import type { UseEntityCrudReturn } from '../../../../core/presentation/hooks/data/useEntity';
import { getCreatePartnershipTypeFormSchema } from '../schemas/partnershipTypeForm.schema';
import { getCreateConsumptionMaterialFormSchema } from '../schemas/consumptionMaterialForm.schema';
import { getLocalizedName } from '../../../../core/presentation/utils/helpes';
import { AuthorizedPersonsField } from './AuthorizedPersonsInput';
import type { AuthorizedPersonPayload } from './authorizedPersons';
import type { Country } from '../../../../core/domain/entities/regions/Country';
import { CountryFormSchema } from '../../../../core/presentation/schemas/regions/countryForm.schema';
import type { MatrixFieldConfig } from '../../../../core/presentation/layouts/ui/inputs/DataMatrixInput';
import { getProductionMatrixRowSchema, getDailyConsumptionRowSchema } from '../schemas/facilityForm.schema';

type Translate = (key: string, module?: string) => string;

interface FacilityFormDeps {
  partnershipTypes: PartnershipType[];
  createPartnershipType: UseEntityCrudReturn<PartnershipType>['create'];
  countries: Country[];
  loadCountries: UseEntityCrudReturn<Country>['getAll'];
  createCountry: UseEntityCrudReturn<Country>['create'];
  consumptionMaterials: ConsumptionMaterial[];
  loadConsumptionMaterials: UseEntityCrudReturn<ConsumptionMaterial>['getAll'];
  createConsumptionMaterial: UseEntityCrudReturn<ConsumptionMaterial>['create'];
}

const createdMaterialUnits = new Map<number | string, string>();

export const buildProductionMatrixFields = (t: Translate): MatrixFieldConfig[] => [
  { name: 'material', type: 'text', label: t('facilities.production_material', 'investments') || 'Material' },
  { name: 'production', type: 'text', label: t('facilities.production_output', 'investments') || 'Production' },
];

export const buildDailyConsumptionMatrixFields = (t: Translate, deps: FacilityFormDeps): MatrixFieldConfig[] => [
  {
    name: 'id',
    type: 'select-or-create',
    label: t('facilities.consumption_material', 'investments') || 'Material',
    required: true,
    searchable: true,
    excludeSelected: true,
    options: deps.consumptionMaterials.map(cm => ({ value: cm.id, label: getLocalizedName(cm.name) })),
    createTitle: t('consumption_materials.create', 'investments') || 'Create Consumption Material',
    labelPath: 'data.name',
    createButtonPermission: 'investments.consumable-materials.create',
    compute: (row, value) => {
      if (value === null || value === undefined || value === '') return { unit: '' };
      const found = deps.consumptionMaterials.find(cm => cm.id === value);
      if (found) return { unit: found.unit ?? '' };
      return { unit: createdMaterialUnits.get(value) ?? '' };
    },
    renderCreateForm: (onSuccessForm, onCancelForm) => (
      <GenericCreateForm
        schema={getCreateConsumptionMaterialFormSchema(t)}
        fields={[
          { name: 'name', type: 'alpha', label: t('consumption_materials.name', 'investments') || 'Material Name', required: true },
          { name: 'unit', type: 'text', label: t('consumption_materials.unit', 'investments') || 'Unit', required: true },
        ]}
        onSubmit={async (data) => {
          const res = await deps.createConsumptionMaterial({ ...data, is_active: true });
          if (res?.data?.id != null) {
            createdMaterialUnits.set(res.data.id, res.data.unit ?? '');
            deps.loadConsumptionMaterials();
          }
          return res;
        }}
        onSuccess={onSuccessForm}
        onCancel={onCancelForm}
        submitLabel={t('common.create', 'shared') || 'Create'}
      />
    ),
  },
  { name: 'consumption', type: 'text', label: t('facilities.consumption_value', 'investments') || 'Consumption', required: true },
  { name: 'unit', type: 'text', label: t('facilities.consumption_unit', 'investments') || 'Unit', disabled: true },
];

export const buildFacilityFormFields = (t: Translate, deps: FacilityFormDeps): FieldConfig[] => [
  { name: 'name', type: 'alpha', label: t('facilities.name', 'investments') || 'Name', required: true, group: 'basic_info' },
  {
    name: 'partnership_type_id',
    type: 'select-or-create',
    label: t('facilities.partnership_type', 'investments') || 'Partnership Type',
    required: true,
    group: 'basic_info',
    options: deps.partnershipTypes.map(pt => ({ value: pt.id, label: getLocalizedName(pt.name), is_default: pt.is_default })),
    createTitle: t('partnership_types.create', 'investments') || 'Create Partnership Type',
    labelPath: 'name',
    createButtonPermission: 'investments.partnership-types.create',
    renderCreateForm: (onSuccessForm, onCancelForm) => (
      <GenericCreateForm
        schema={getCreatePartnershipTypeFormSchema(t)}
        fields={[
          { name: 'name', type: 'alpha', label: t('common.name', 'shared') || 'Name', required: true },
          { name: 'is_default', type: 'checkbox', label: t('common.is_default', 'shared') || 'Set as Default' },
        ]}
        onSubmit={(data) => deps.createPartnershipType({ ...data, is_active: true })}
        onSuccess={onSuccessForm}
        onCancel={onCancelForm}
        submitLabel={t('common.create', 'shared') || 'Create'}
      />
    ),
  },
  { name: 'address', type: 'text', label: t('facilities.address', 'investments') || 'Address', required: true, group: 'basic_info' },
  {
    name: 'company_type',
    type: 'select',
    label: t('facilities.company_type', 'investments') || 'Company Type',
    required: true,
    group: 'basic_info',
    options: [
      { value: 'existing', label: t('facilities.company_type_existing', 'investments') || 'Existing' },
      { value: 'under_incorporation', label: t('facilities.company_type_under_incorporation', 'investments') || 'Under Incorporation' },
    ],
  },
  {
    name: 'company_nationality_id',
    type: 'select-or-create',
    searchable: true,
    label: t('facilities.company_nationality', 'investments') || 'Company Nationality',
    required: true,
    group: 'basic_info',
    createTitle: t('facilities.add_country', 'investments') || 'Add Country',
    labelPath: 'data.name',
    options: deps.countries.map((c) => ({ value: c.id, label: getLocalizedName(c.name), is_default: c.is_default })),
    compute: async () => {
      const res = await deps.loadCountries()
      return { options: res.data.map((c) => ({ value: c.id, label: getLocalizedName(c.name), is_default: c.is_default })) }
    },
    renderCreateForm: (onSuccessForm, onCancelForm) => (
      <GenericCreateForm
        schema={CountryFormSchema}
        fields={[
          { name: 'name', type: 'alpha', label: t('common.name', 'shared') || 'Name', required: true },
          { name: 'is_default', type: 'checkbox', label: t('common.is_default', 'shared') || 'Set as Default' },
        ]}
        onSubmit={async (data) => {
          const res = await deps.createCountry({ ...data, name: typeof data.name === 'string' ? { ar: data.name } : data.name })
          return res
        }}
        onSuccess={onSuccessForm}
        onCancel={onCancelForm}
        submitLabel={t('common.create', 'shared') || 'Create'}
      />
    ),
  },
  {
    name: 'commercial_register',
    type: 'text',
    label: t('facilities.commercial_register', 'investments') || 'Commercial Register',
    group: 'basic_info',
    dependsOn: ['company_type'],
    compute: (values) => {
      const enabled = values.company_type === 'existing'
      return { disabled: !enabled, required: enabled, value: enabled ? undefined : '' }
    },
  },
  {
    name: 'commercial_register_date',
    type: 'date',
    label: t('facilities.commercial_register_date', 'investments') || 'Commercial Register Date',
    group: 'basic_info',
    dependsOn: ['company_type'],
    compute: (values) => {
      const enabled = values.company_type === 'existing'
      return { disabled: !enabled, required: enabled, value: enabled ? undefined : '' }
    },
  },
  { name: 'first_phone_number', type: 'numeric', label: t('facilities.first_phone_number', 'investments') || 'Phone', required: true, group: 'contact' },
  { name: 'second_phone_number', type: 'numeric', label: t('facilities.second_phone_number', 'investments') || 'Phone 2', group: 'contact' },
  { name: 'email', type: 'email', label: t('facilities.email', 'investments') || 'Email', group: 'contact' },
  { name: 'total_capital_in_syp', type: 'number', label: t('facilities.total_capital_in_syp', 'investments') || 'Capital (SYP)', required: true, group: 'financial' },
  { name: 'total_capital_in_usd', type: 'number', label: t('facilities.total_capital_in_usd', 'investments') || 'Capital (USD)', required: true, group: 'financial' },
  { name: 'value_of_machines_in_syp', type: 'number', label: t('facilities.value_of_machines_in_syp', 'investments') || 'Machinery Value (SYP)', required: true, group: 'financial' },
  { name: 'value_of_machines_in_usd', type: 'number', label: t('facilities.value_of_machines_in_usd', 'investments') || 'Machinery Value (USD)', required: true, group: 'financial' },
  { name: 'number_of_workers', type: 'number', min: -1, label: t('facilities.number_of_workers', 'investments') || 'Workers', required: true, group: 'production' },
  { name: 'number_or_patrols', type: 'number', min: -1, label: t('facilities.number_or_patrols', 'investments') || 'Number of Patrols', group: 'production' },
  { name: 'telephone_lines_number', type: 'number', min: 0, label: t('facilities.telephone_lines_number', 'investments') || 'Telephone Lines Number', group: 'production' },
  { name: 'yearly_imported_raw_materials', type: 'text', label: t('facilities.yearly_imported_raw_materials', 'investments') || 'Yearly Imported Raw Materials', group: 'production' },
  { name: 'daily_production_capacities', type: 'data-matrix', label: t('facilities.daily_production_capacities', 'investments') || 'Daily Capacity', group: 'production', matrixFields: buildProductionMatrixFields(t), rowSchema: getProductionMatrixRowSchema(t) },
  { name: 'monthly_production_capacities', type: 'data-matrix', label: t('facilities.monthly_production_capacities', 'investments') || 'Monthly Capacity', group: 'production', matrixFields: buildProductionMatrixFields(t), rowSchema: getProductionMatrixRowSchema(t) },
  { name: 'yearly_production_capacities', type: 'data-matrix', label: t('facilities.yearly_production_capacities', 'investments') || 'Annual Capacity', required: true, group: 'production', matrixFields: buildProductionMatrixFields(t), rowSchema: getProductionMatrixRowSchema(t), minRows: 1 },
  { name: 'daily_consumption', type: 'data-matrix', label: t('facilities.daily_consumption', 'investments') || 'Daily Consumption Volume', group: 'production', matrixFields: buildDailyConsumptionMatrixFields(t, deps), rowSchema: getDailyConsumptionRowSchema(t) },
  { name: 'export_to_production_ratio', type: 'number', min: 0, max: 100, label: t('facilities.export_to_production_ratio', 'investments') || 'Export to Production Ratio', group: 'production' },
  { name: 'electrical_power_capacity', type: 'text', label: t('facilities.electrical_power_capacity', 'investments') || 'Power Capacity', required: true, group: 'utilities' },
  { name: 'monthly_internet_data_requirement', type: 'number', min: 0, label: t('facilities.monthly_internet_data_requirement', 'investments') || 'Monthly Internet Data Requirement', group: 'utilities' },
  { name: 'yearly_estimated_drinking_water_consumption', type: 'number', label: t('facilities.yearly_estimated_drinking_water_consumption', 'investments') || 'Drinking Water Consumption', required: true, group: 'utilities' },
  { name: 'yearly_estimated_industrial_water_consumption', type: 'number', label: t('facilities.yearly_estimated_industrial_water_consumption', 'investments') || 'Industrial Water Consumption', required: true, group: 'utilities' },
  {
    name: 'authorized_persons',
    label: t('facilities.authorized_persons', 'investments') || 'Authorized Persons',
    group: 'authorized_persons',
    render: (methods) => <AuthorizedPersonsField methods={methods} />,
  },
  {
    name: 'require_all_persons_for_legal_matters',
    label: t('facilities.require_all_persons_for_legal_matters', 'investments') || 'Require All Persons for Legal Matters',
    type: 'checkbox',
    group: 'authorized_persons',
  },
];

export const buildFacilityFormGroups = (t: Translate): GroupConfig[] => [
  {
    group: 'basic_info',
    title: t('facilities.group_basic_info', 'investments') || 'Basic Information',
    columns: 3,
    rows: [
      ['name', 'partnership_type_id', 'company_type'],
      ['address', 'company_nationality_id'],
      ['commercial_register', 'commercial_register_date'],
    ],
  },
  {
    group: 'contact',
    title: t('facilities.group_contact', 'investments') || 'Contact Information',
    columns: 3,
    rows: [['first_phone_number', 'second_phone_number', 'email']],
  },
  {
    group: 'financial',
    title: t('facilities.group_financial', 'investments') || 'Financial Information',
    columns: 2,
    rows: [
      ['total_capital_in_syp', 'total_capital_in_usd'],
      ['value_of_machines_in_syp', 'value_of_machines_in_usd'],
    ],
  },
  {
    group: 'production',
    title: t('facilities.group_production', 'investments') || 'Production Capacity',
    columns: 2,
    rows: [
      ['number_of_workers', 'number_or_patrols'],
      ['telephone_lines_number', 'yearly_imported_raw_materials'],
      ['daily_production_capacities', 'monthly_production_capacities'],
      ['yearly_production_capacities', 'export_to_production_ratio'],
      ['daily_consumption'],
    ],
  },
  {
    group: 'utilities',
    title: t('facilities.group_utilities', 'investments') || 'Utilities',
    columns: 2,
    rows: [['electrical_power_capacity', 'monthly_internet_data_requirement'], ['yearly_estimated_drinking_water_consumption', 'yearly_estimated_industrial_water_consumption']],
  },
  {
    group: 'authorized_persons',
    title: t('facilities.group_authorized_persons', 'investments') || 'Authorized Persons',
    columns: 1,
    rows: [['authorized_persons'], ['require_all_persons_for_legal_matters']],
  },
];

export type DailyConsumptionMatrixRow = { material: number; consumption: string; unit: string };

export const buildFacilityDefaultValues = (facility: Facility): Record<string, string | number | boolean | AuthorizedPersonPayload[] | ProductionCapacityRow[] | DailyConsumptionMatrixRow[] | null | undefined> => ({
  name: facility.name,
  partnership_type_id: facility.partnership_type?.id ?? facility.partnership_type_id ?? null,
  address: facility.address,
  company_type: facility.company_type ?? 'under_incorporation',
  commercial_register: facility.commercial_register ?? '',
  commercial_register_date: facility.commercial_register_date ?? '',
  company_nationality_id: facility.company_nationality_id ?? null,
  first_phone_number: facility.first_phone_number,
  second_phone_number: facility.second_phone_number ?? null,
  email: facility.email || '',
  total_capital_in_syp: facility.total_capital_in_syp,
  total_capital_in_usd: facility.total_capital_in_usd,
  value_of_machines_in_syp: facility.value_of_machines_in_syp,
  value_of_machines_in_usd: facility.value_of_machines_in_usd,
  number_of_workers: facility.number_of_workers,
  number_or_patrols: facility.number_or_patrols ?? null,
  telephone_lines_number: facility.telephone_lines_number ?? null,
  monthly_internet_data_requirement: facility.monthly_internet_data_requirement ?? null,
  yearly_imported_raw_materials: facility.yearly_imported_raw_materials ?? '',
  export_to_production_ratio: facility.export_to_production_ratio ?? null,
  daily_production_capacities: facility.daily_production_capacities ?? [],
  monthly_production_capacities: facility.monthly_production_capacities ?? [],
  yearly_production_capacities: facility.yearly_production_capacities ?? [],
  daily_consumption: (facility.daily_consumption ?? []).map((row) => ({
    material: row.id,
    consumption: String(row.consumption ?? ''),
    unit: '',
  })),
  electrical_power_capacity: String(facility.electrical_power_capacity ?? ''),
  yearly_estimated_drinking_water_consumption: facility.yearly_estimated_drinking_water_consumption,
  yearly_estimated_industrial_water_consumption: facility.yearly_estimated_industrial_water_consumption ?? null,
  require_all_persons_for_legal_matters: facility.require_all_persons_for_legal_matters ?? true,
  authorized_persons: facility.authorized_persons as AuthorizedPersonPayload[] | undefined,
});