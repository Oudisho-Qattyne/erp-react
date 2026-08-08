import type { FieldConfig, GroupConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { GenericCreateForm } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { BuildingLicense } from '../../domain/entities/buildinglicense';
import type { LicensingStatus } from '../../domain/entities/licensingStatus';
import type { ByDurationLicense } from '../../domain/entities/byDurationLicense';
import type { ByIndustryLicense } from '../../domain/entities/byIndustryLicense';
import type { UseEntityCrudReturn } from '../../../../core/presentation/hooks/data/useEntity';
import { getCreateLicensingStatusFormSchema } from '../schemas/licensingStatusForm.schema';
import { getCreateByDurationLicenseFormSchema } from '../schemas/byDurationLicenseForm.schema';
import { getCreateByIndustryLicenseFormSchema } from '../schemas/byIndustryLicenseForm.schema';
import { getLocalizedName } from '../../../../core/presentation/utils/helpes';

type Translate = (key: string, module?: string) => string;

interface BuildingLicenseFormDeps {
  licensingStatuses: LicensingStatus[];
  createLicensingStatus: UseEntityCrudReturn<LicensingStatus>['create'];
  durationLicenses: ByDurationLicense[];
  createDurationLicense: UseEntityCrudReturn<ByDurationLicense>['create'];
  industryLicenses: ByIndustryLicense[];
  createIndustryLicense: UseEntityCrudReturn<ByIndustryLicense>['create'];
}

export const buildBuildingLicenseFormFields = (t: Translate, deps: BuildingLicenseFormDeps): FieldConfig[] => [
  { name: 'building_license_number', type: 'numeric', label: t('building_license.building_license_number', 'investments') || 'License Number', required: true, group: 'license_info' },
  { name: 'building_license_date', type: 'date', label: t('building_license.building_license_date', 'investments') || 'License Date', required: true, group: 'license_info' },
  { name: 'licensed_area', type: 'number', label: t('building_license.licensed_area', 'investments') || 'Licensed Area', required: true, group: 'license_info' },
  {
    name: 'licensing_status_id',
    type: 'select-or-create',
    label: t('building_license.licensing_status_id', 'investments') || 'Licensing Status',
    required: true,
    group: 'status',
    options: deps.licensingStatuses.map(s => ({ value: s.id, label: getLocalizedName(s.name), is_default: s.is_default })),
    createTitle: t('licensing_statuses.create', 'investments') || 'Create Licensing Status',
    labelPath: 'name',
    createButtonPermission: 'investments.license-statuses.create',
    renderCreateForm: (onSuccessForm, onCancelForm) => (
      <GenericCreateForm
        schema={getCreateLicensingStatusFormSchema(t)}
        fields={[
          { name: 'name', type: 'alpha', label: t('common.name', 'shared') || 'Name', required: true },
          { name: 'is_default', type: 'checkbox', label: t('common.is_default', 'shared') || 'Set as Default' },
        ]}
        onSubmit={(data) => deps.createLicensingStatus({ ...data, is_active: true })}
        onSuccess={onSuccessForm}
        onCancel={onCancelForm}
        submitLabel={t('common.create', 'shared') || 'Create'}
      />
    ),
  },
  { name: 'date_of_displaying_license_info', type: 'date', label: t('building_license.date_of_displaying_license_info', 'investments') || 'Display Date', required: true, group: 'status' },
  { name: 'administrative_license_decision_number', type: 'numeric', label: t('building_license.administrative_license_decision_number', 'investments') || 'Admin Decision #', required: true, group: 'admin_decision' },
  { name: 'administrative_license_decision_date', type: 'date', label: t('building_license.administrative_license_decision_date', 'investments') || 'Admin Decision Date', required: true, group: 'admin_decision' },
  {
    name: 'by_duration_license_id',
    type: 'select-or-create',
    label: t('building_license.by_duration_license_id', 'investments') || 'Duration License',
    required: true,
    group: 'license_types',
    options: deps.durationLicenses.map(d => ({ value: d.id, label: getLocalizedName(d.name), is_default: d.is_default })),
    createTitle: t('by_duration_licenses.create', 'investments') || 'Create Duration License',
    labelPath: 'name',
    createButtonPermission: 'investments.by-duration-licenses.create',
    renderCreateForm: (onSuccessForm, onCancelForm) => (
      <GenericCreateForm
        schema={getCreateByDurationLicenseFormSchema(t)}
        fields={[
          { name: 'name', type: 'alpha', label: t('common.name', 'shared') || 'Name', required: true },
          { name: 'is_default', type: 'checkbox', label: t('common.is_default', 'shared') || 'Set as Default' },
        ]}
        onSubmit={(data) => deps.createDurationLicense({ ...data, is_active: true })}
        onSuccess={onSuccessForm}
        onCancel={onCancelForm}
        submitLabel={t('common.create', 'shared') || 'Create'}
      />
    ),
  },
  {
    name: 'by_industry_license_id',
    type: 'select-or-create',
    label: t('building_license.by_industry_license_id', 'investments') || 'Industry License',
    required: true,
    group: 'license_types',
    options: deps.industryLicenses.map(l => ({ value: l.id, label: getLocalizedName(l.name), is_default: l.is_default })),
    createTitle: t('by_industry_licenses.create', 'investments') || 'Create Industry License',
    labelPath: 'name',
    createButtonPermission: 'investments.by-industry-licenses.create',
    renderCreateForm: (onSuccessForm, onCancelForm) => (
      <GenericCreateForm
        schema={getCreateByIndustryLicenseFormSchema(t)}
        fields={[
          { name: 'name', type: 'alpha', label: t('common.name', 'shared') || 'Name', required: true },
          { name: 'is_default', type: 'checkbox', label: t('common.is_default', 'shared') || 'Set as Default' },
        ]}
        onSubmit={(data) => deps.createIndustryLicense({ ...data, is_active: true })}
        onSuccess={onSuccessForm}
        onCancel={onCancelForm}
        submitLabel={t('common.create', 'shared') || 'Create'}
      />
    ),
  },
  { name: 'temp_administrative_license_expiration_date', type: 'date', label: t('building_license.temp_administrative_license_expiration_date', 'investments') || 'Temp Expiration Date', required: true, group: 'license_types' },
];

export const buildBuildingLicenseFormGroups = (t: Translate): GroupConfig[] => [
  {
    group: 'license_info',
    title: t('building_license.group_license_info', 'investments') || 'License Information',
    columns: 3,
    rows: [['building_license_number', 'building_license_date', 'licensed_area']],
  },
  {
    group: 'status',
    title: t('building_license.group_status', 'investments') || 'Licensing Status',
    columns: 2,
    rows: [['licensing_status_id', 'date_of_displaying_license_info']],
  },
  {
    group: 'admin_decision',
    title: t('building_license.group_admin_decision', 'investments') || 'Admin Decision',
    columns: 2,
    rows: [['administrative_license_decision_number', 'administrative_license_decision_date']],
  },
  {
    group: 'license_types',
    title: t('building_license.group_license_types', 'investments') || 'License Types',
    columns: 2,
    rows: [
      ['by_duration_license_id', 'by_industry_license_id'],
      ['temp_administrative_license_expiration_date'],
    ],
  },
];

const normalizeDate = (dateStr: string) => {
  if (!dateStr) return '';
  const isoMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

export const buildBuildingLicenseDefaultValues = (license: BuildingLicense): Record<string, string | number | null | undefined> => ({
  building_license_number: license.building_license_number,
  building_license_date: normalizeDate(license.building_license_date),
  licensed_area: license.licensed_area,
  licensing_status_id: license.licensing_status?.id ?? license.licensing_status_id,
  date_of_displaying_license_info: normalizeDate(license.date_of_displaying_license_info),
  administrative_license_decision_number: license.administrative_license_decision_number,
  administrative_license_decision_date: normalizeDate(license.administrative_license_decision_date),
  by_duration_license_id: license.by_duration_license_id,
  by_industry_license_id: license.by_industry_license_id,
  temp_administrative_license_expiration_date: normalizeDate(license.temp_administrative_license_expiration_date),
});