import type { FieldConfig, GroupConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { GenericCreateForm } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { FacilityIndustrialLicense } from '../../domain/entities/facilityIndustrialLicense';
import type { IndustryCategory } from '../../domain/entities/industryCategory';
import type { IndustryType } from '../../domain/entities/industryType';
import type { IndustrialDecisionType } from '../../domain/entities/industrialDecisionType';
import type { IndustrialLicenseSource } from '../../domain/entities/industrialLicenseSource';
import type { UseEntityCrudReturn } from '../../../../core/presentation/hooks/data/useEntity';
import { getCreateIndustryCategoryFormSchema } from '../schemas/industryCategoryForm.schema';
import { getCreateIndustryTypeFormSchema } from '../schemas/industryTypeForm.schema';
import { getCreateIndustrialDecisionTypeFormSchema } from '../schemas/industrialDecisionTypeForm.schema';
import { getCreateIndustrialLicenseSourceFormSchema } from '../schemas/industrialLicenseSourceForm.schema';
import { getLocalizedName } from '../../../../core/presentation/utils/helpes';

type Translate = (key: string, module?: string) => string;

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

interface FacilityIndustrialLicenseFormDeps {
  categories: IndustryCategory[];
  createCategory: UseEntityCrudReturn<IndustryCategory>['create'];
  industryTypes: IndustryType[];
  createIndustryType: UseEntityCrudReturn<IndustryType>['create'];
  decisionTypes: IndustrialDecisionType[];
  createDecisionType: UseEntityCrudReturn<IndustrialDecisionType>['create'];
  licenseSources: IndustrialLicenseSource[];
  createLicenseSource: UseEntityCrudReturn<IndustrialLicenseSource>['create'];
}

export const buildFacilityIndustrialLicenseFormFields = (t: Translate, deps: FacilityIndustrialLicenseFormDeps): FieldConfig[] => [
  {
    name: 'industry_category_id',
    type: 'select-or-create',
    label: t('facility_industrial_licenses.industry_category', 'investments') || 'Industry Category',
    required: true,
    group: 'industry',
    options: deps.categories.map(c => ({ value: c.id, label: getLocalizedName(c.name), is_default: c.is_default })),
    createTitle: t('industry_categories.create', 'investments') || 'Create Industry Category',
    labelPath: 'name',
    createButtonPermission: 'investments.industry-categories.create',
    renderCreateForm: (onSuccessForm, onCancelForm) => (
      <GenericCreateForm
        schema={getCreateIndustryCategoryFormSchema(t)}
        fields={[
          { name: 'name', type: 'alpha', label: t('common.name', 'shared') || 'Name', required: true },
          { name: 'is_default', type: 'checkbox', label: t('common.is_default', 'shared') || 'Set as Default' },
        ]}
        onSubmit={(data) => deps.createCategory({ ...data, is_active: true })}
        onSuccess={onSuccessForm}
        onCancel={onCancelForm}
        submitLabel={t('common.create', 'shared') || 'Create'}
      />
    ),
  },
  {
    name: 'industry_type_id',
    type: 'select-or-create',
    label: t('facility_industrial_licenses.industry_type', 'investments') || 'Industry Type',
    required: true,
    group: 'industry',
    options: deps.industryTypes.map(industryType => ({ value: industryType.id, label: getLocalizedName(industryType.name), is_default: industryType.is_default })),
    createTitle: t('industry_types.create', 'investments') || 'Create Industry Type',
    labelPath: 'name',
    createButtonPermission: 'investments.industry-types.create',
    renderCreateForm: (onSuccessForm, onCancelForm) => (
      <GenericCreateForm
        schema={getCreateIndustryTypeFormSchema(t)}
        fields={[
          { name: 'name', type: 'alpha', label: t('common.name', 'shared') || 'Name', required: true },
          { name: 'is_default', type: 'checkbox', label: t('common.is_default', 'shared') || 'Set as Default' },
        ]}
        onSubmit={(data) => deps.createIndustryType({ ...data, is_active: true })}
        onSuccess={onSuccessForm}
        onCancel={onCancelForm}
        submitLabel={t('common.create', 'shared') || 'Create'}
      />
    ),
  },
  { name: 'industrial_decision_number', type: 'numeric', label: t('facility_industrial_licenses.decision_number', 'investments') || 'Decision Number', required: true, group: 'decision' },
  { name: 'industrial_decision_date', type: 'date', label: t('facility_industrial_licenses.decision_date', 'investments') || 'Decision Date', required: true, group: 'decision' },
  {
    name: 'industrial_decision_type_id',
    type: 'select-or-create',
    label: t('facility_industrial_licenses.decision_type', 'investments') || 'Decision Type',
    required: true,
    group: 'decision',
    options: deps.decisionTypes.map(d => ({ value: d.id, label: getLocalizedName(d.name), is_default: d.is_default })),
    createTitle: t('industrial_decision_types.create', 'investments') || 'Create Decision Type',
    labelPath: 'name',
    createButtonPermission: 'investments.industrial-decision-types.create',
    renderCreateForm: (onSuccessForm, onCancelForm) => (
      <GenericCreateForm
        schema={getCreateIndustrialDecisionTypeFormSchema(t)}
        fields={[
          { name: 'name', type: 'alpha', label: t('common.name', 'shared') || 'Name', required: true },
          { name: 'is_default', type: 'checkbox', label: t('common.is_default', 'shared') || 'Set as Default' },
        ]}
        onSubmit={(data) => deps.createDecisionType({ ...data, is_active: true })}
        onSuccess={onSuccessForm}
        onCancel={onCancelForm}
        submitLabel={t('common.create', 'shared') || 'Create'}
      />
    ),
  },
  {
    name: 'industrial_license_source_id',
    type: 'select-or-create',
    label: t('facility_industrial_licenses.license_source', 'investments') || 'License Source',
    required: true,
    group: 'decision',
    options: deps.licenseSources.map(s => ({ value: s.id, label: getLocalizedName(s.name), is_default: s.is_default })),
    createTitle: t('industrial_license_sources.create', 'investments') || 'Create License Source',
    labelPath: 'name',
    createButtonPermission: 'investments.industrial-license-sources.create',
    renderCreateForm: (onSuccessForm, onCancelForm) => (
      <GenericCreateForm
        schema={getCreateIndustrialLicenseSourceFormSchema(t)}
        fields={[
          { name: 'name', type: 'alpha', label: t('common.name', 'shared') || 'Name', required: true },
          { name: 'is_default', type: 'checkbox', label: t('common.is_default', 'shared') || 'Set as Default' },
        ]}
        onSubmit={(data) => deps.createLicenseSource({ ...data, is_active: true })}
        onSuccess={onSuccessForm}
        onCancel={onCancelForm}
        submitLabel={t('common.create', 'shared') || 'Create'}
      />
    ),
  },
];

export const buildFacilityIndustrialLicenseFormGroups = (t: Translate): GroupConfig[] => [
  {
    group: 'industry',
    title: t('facility_industrial_licenses.group_industry', 'investments') || 'Industry Selection',
    columns: 2,
    rows: [['industry_category_id', 'industry_type_id']],
  },
  {
    group: 'decision',
    title: t('facility_industrial_licenses.group_decision', 'investments') || 'Decision Details',
    columns: 2,
    rows: [
      ['industrial_decision_number', 'industrial_decision_date'],
      ['industrial_decision_type_id', 'industrial_license_source_id'],
    ],
  },
];

export const buildFacilityIndustrialLicenseDefaultValues = (license: FacilityIndustrialLicense): Record<string, string | number | null | undefined> => ({
  industry_category_id: license.industry_category?.id ?? null,
  industry_type_id: license.industry_type?.id ?? null,
  industrial_decision_number: license.industrial_decision_number,
  industrial_decision_date: normalizeDate(license.industrial_decision_date),
  industrial_decision_type_id: license.industrial_decision_type?.id ?? null,
  industrial_license_source_id: license.industrial_license_source?.id ?? null,
});