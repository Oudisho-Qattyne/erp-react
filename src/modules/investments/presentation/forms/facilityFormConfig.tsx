import type { FieldConfig, GroupConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { GenericCreateForm } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { Facility, ProductionCapacityRow, DailyConsumptionRow } from '../../domain/entities/facility';
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
    name: 'material',
    type: 'select-or-create',
    label: t('facilities.consumption_material', 'investments') || 'Material',
    required: true,
    searchable: true,
    excludeSelected: true,
    options: deps.consumptionMaterials.map(cm => ({ value: cm.id, label: getLocalizedName(cm.name) })),
    createTitle: t('consumption_materials.create', 'investments') || 'Create Consumption Material',
    labelPath: 'data.name',
    // createButtonPermission: 'investments.consumption-materials.create',
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
    name: 'company_status',
    type: 'select',
    label: t('facilities.company_status', 'investments') || 'Company Status',
    required: true,
    group: 'basic_info',
    options: [
      { value: 'established', label: t('facilities.company_status_established', 'investments') || 'Established' },
      { value: 'in_incorporation', label: t('facilities.company_status_in_incorporation', 'investments') || 'Under Incorporation' },
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
    name: 'commercial_registry',
    type: 'text',
    label: t('facilities.commercial_registry', 'investments') || 'Commercial Registry',
    group: 'basic_info',
    dependsOn: ['company_status'],
    compute: (values) => {
      const enabled = values.company_status === 'established'
      return { disabled: !enabled, required: enabled, value: enabled ? undefined : '' }
    },
  },
  {
    name: 'commercial_registry_date',
    type: 'date',
    label: t('facilities.commercial_registry_date', 'investments') || 'Commercial Registry Date',
    group: 'basic_info',
    dependsOn: ['company_status'],
    compute: (values) => {
      const enabled = values.company_status === 'established'
      return { disabled: !enabled, required: enabled, value: enabled ? undefined : '' }
    },
  },
  { name: 'first_phone_number', type: 'numeric', label: t('facilities.first_phone_number', 'investments') || 'Phone', group: 'contact' },
  { name: 'second_phone_number', type: 'numeric', label: t('facilities.second_phone_number', 'investments') || 'Phone 2', group: 'contact' },
  { name: 'email', type: 'email', label: t('facilities.email', 'investments') || 'Email', group: 'contact' },
  { name: 'capital_in_syp', type: 'number', label: t('facilities.capital_in_syp', 'investments') || 'Capital (SYP)', required: true, group: 'financial' },
  { name: 'capital_in_usd', type: 'number', label: t('facilities.capital_in_usd', 'investments') || 'Capital (USD)', required: true, group: 'financial' },
  { name: 'value_of_machines_in_syp', type: 'number', label: t('facilities.value_of_machines_in_syp', 'investments') || 'Machinery Value (SYP)', required: true, group: 'financial' },
  { name: 'value_of_machines_in_usd', type: 'number', label: t('facilities.value_of_machines_in_usd', 'investments') || 'Machinery Value (USD)', required: true, group: 'financial' },
  { name: 'number_of_workers', type: 'number', min: -1, label: t('facilities.number_of_workers', 'investments') || 'Workers', required: true, group: 'production' },
  { name: 'number_of_patrols', type: 'number', min: -1, label: t('facilities.number_of_patrols', 'investments') || 'Number of Patrols', group: 'production' },
  { name: 'number_of_phone_lines', type: 'number', min: 0, label: t('facilities.number_of_phone_lines', 'investments') || 'Number of Phone Lines', group: 'production' },
  { name: 'imported_raw_materials_annually', type: 'text', label: t('facilities.imported_raw_materials_annually', 'investments') || 'Imported Raw Materials Annually', group: 'production' },
  { name: 'daily_production_capacity', type: 'data-matrix', label: t('facilities.daily_production_capacity', 'investments') || 'Daily Capacity', group: 'production', matrixFields: buildProductionMatrixFields(t), rowSchema: getProductionMatrixRowSchema(t) },
  { name: 'monthly_production_capacity', type: 'data-matrix', label: t('facilities.monthly_production_capacity', 'investments') || 'Monthly Capacity', group: 'production', matrixFields: buildProductionMatrixFields(t), rowSchema: getProductionMatrixRowSchema(t) },
  { name: 'yearly_production_capacity', type: 'data-matrix', label: t('facilities.yearly_production_capacity', 'investments') || 'Annual Capacity', required: true, group: 'production', matrixFields: buildProductionMatrixFields(t), rowSchema: getProductionMatrixRowSchema(t), minRows: 1 },
  { name: 'daily_consumption_volume', type: 'data-matrix', label: t('facilities.daily_consumption_volume', 'investments') || 'Daily Consumption Volume', group: 'production', matrixFields: buildDailyConsumptionMatrixFields(t, deps), rowSchema: getDailyConsumptionRowSchema(t) },
  { name: 'export_percentage', type: 'number', min: 0, max: 100, label: t('facilities.export_percentage', 'investments') || 'Export Percentage of Production', group: 'production' },
  { name: 'electrical_power_capacity', type: 'text', label: t('facilities.electrical_power_capacity', 'investments') || 'Power Capacity', required: true, group: 'utilities' },
  { name: 'yearly_estimated_water_consumption', type: 'number', label: t('facilities.yearly_estimated_water_consumption', 'investments') || 'Water Consumption', required: true, group: 'utilities' },
  { name: 'internet_need_monthly_gb', type: 'number', min: 0, label: t('facilities.internet_need_monthly_gb', 'investments') || 'Monthly Internet Need (GB)', group: 'utilities' },
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
      ['name', 'partnership_type_id', 'company_status'],
      ['address', 'company_nationality_id'],
      ['commercial_registry', 'commercial_registry_date'],
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
      ['capital_in_syp', 'capital_in_usd'],
      ['value_of_machines_in_syp', 'value_of_machines_in_usd'],
    ],
  },
  {
    group: 'production',
    title: t('facilities.group_production', 'investments') || 'Production Capacity',
    columns: 2,
    rows: [
      ['number_of_workers', 'number_of_patrols'],
      ['number_of_phone_lines', 'imported_raw_materials_annually'],
      ['daily_production_capacity', 'monthly_production_capacity'],
      ['yearly_production_capacity', 'export_percentage'],
      ['daily_consumption_volume'],
    ],
  },
  {
    group: 'utilities',
    title: t('facilities.group_utilities', 'investments') || 'Utilities',
    columns: 2,
    rows: [['electrical_power_capacity', 'yearly_estimated_water_consumption'], ['internet_need_monthly_gb']],
  },
  {
    group: 'authorized_persons',
    title: t('facilities.group_authorized_persons', 'investments') || 'Authorized Persons',
    columns: 1,
    rows: [['authorized_persons'], ['require_all_persons_for_legal_matters']],
  },
];

export const buildFacilityDefaultValues = (facility: Facility): Record<string, string | number | boolean | AuthorizedPersonPayload[] | ProductionCapacityRow[] | DailyConsumptionRow[] | null | undefined> => ({
  name: facility.name,
  partnership_type_id: facility.partnership_type?.id ?? facility.partnership_type_id ?? null,
  address: facility.address,
  company_status: facility.company_status ?? 'in_incorporation',
  commercial_registry: facility.commercial_registry ?? '',
  commercial_registry_date: facility.commercial_registry_date ?? '',
  company_nationality_id: facility.company_nationality_id ?? null,
  first_phone_number: facility.first_phone_number,
  second_phone_number: facility.second_phone_number ?? null,
  email: facility.email || '',
  capital_in_syp: facility.capital_in_syp,
  capital_in_usd: facility.capital_in_usd,
  value_of_machines_in_syp: facility.value_of_machines_in_syp,
  value_of_machines_in_usd: facility.value_of_machines_in_usd,
  number_of_workers: facility.number_of_workers,
  number_of_patrols: facility.number_of_patrols ?? null,
  number_of_phone_lines: facility.number_of_phone_lines ?? null,
  internet_need_monthly_gb: facility.internet_need_monthly_gb ?? null,
  imported_raw_materials_annually: facility.imported_raw_materials_annually ?? '',
  export_percentage: facility.export_percentage ?? null,
  daily_production_capacity: facility.daily_production_capacity ?? [],
  monthly_production_capacity: facility.monthly_production_capacity ?? [],
  yearly_production_capacity: facility.yearly_production_capacity ?? [],
  daily_consumption_volume: facility.daily_consumption_volume ?? [],
  electrical_power_capacity: String(facility.electrical_power_capacity ?? ''),
  yearly_estimated_water_consumption: facility.yearly_estimated_water_consumption,
  require_all_persons_for_legal_matters: facility.require_all_persons_for_legal_matters ?? true,
  authorized_persons: facility.authorized_persons as AuthorizedPersonPayload[] | undefined,
});