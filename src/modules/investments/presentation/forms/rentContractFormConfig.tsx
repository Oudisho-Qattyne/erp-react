import type { FieldConfig, GroupConfig } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { GenericCreateForm } from '../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { RentContract } from '../../domain/entities/rentContract';
import type { RentContractIndustry } from '../../domain/entities/rentContractIndustry';
import type { UseEntityCrudReturn } from '../../../../core/presentation/hooks/data/useEntity';
import { getCreateRentContractIndustryFormSchema } from '../schemas/rentContractIndustryForm.schema';
import { getLocalizedName } from '../../../../core/presentation/utils/helpes';

type Translate = (key: string, module?: string) => string;

interface RentContractFormDeps {
  industries: RentContractIndustry[];
  createIndustry: UseEntityCrudReturn<RentContractIndustry>['create'];
  getIndustries: UseEntityCrudReturn<RentContractIndustry>['getAll'];
}

export const buildRentContractFormFields = (t: Translate, deps: RentContractFormDeps): FieldConfig[] => [
  { name: 'renter_name', type: 'alpha', label: t('rent_contract.renter_name', 'investments') || 'Renter Name', required: true, group: 'renter_info' },
  { name: 'renter_phone', type: 'numeric', label: t('rent_contract.renter_phone', 'investments') || 'Phone', required: true, group: 'renter_info' },
  { name: 'rent_contract_number', type: 'numeric', label: t('rent_contract.rent_contract_number', 'investments') || 'Contract Number', required: true, group: 'contract_details' },
  { name: 'rent_contract_date', type: 'date', label: t('rent_contract.rent_contract_date', 'investments') || 'Contract Date', required: true, group: 'contract_details' },
  { name: 'rent_area', type: 'number', label: t('rent_contract.rent_area', 'investments') || 'Rent Area (㎡)', required: true, group: 'renter_info' },
  { name: 'rent_contract_duration', type: 'date', label: t('rent_contract.rent_contract_duration', 'investments') || 'Duration', required: true, group: 'contract_details' },
  {
    name: 'rent_contract_industry_id',
    type: 'select-or-create',
    searchable: true,
    label: t('rent_contract.rent_contract_industry_id', 'investments') || 'Industry',
    options: deps.industries.map(i => ({ value: i.id, label: getLocalizedName(i.name), is_default: i.is_default })),
    createTitle: t('rent_contract_industries.add', 'investments') || 'Add Industry',
    renderCreateForm: (onSuccess, onCancel) => (
      <GenericCreateForm
        schema={getCreateRentContractIndustryFormSchema(t)}
        fields={[
          { name: 'name', type: 'alpha', label: t('rent_contract_industries.name', 'investments') || 'Name', required: true },
        ]}
        onSubmit={async (data) => {
          const res = await deps.createIndustry(data);
          await deps.getIndustries('/investments/rent-contract-industries?is_active=true');
          return res;
        }}
        onSuccess={(id, result) => {
          onSuccess(id ?? result?.data?.id, result?.data ?? result);
        }}
        onCancel={onCancel}
        submitLabel={t('rent_contract_industries.add', 'investments') || 'Add Industry'}
      />
    ),
    group: 'contract_details',
  },
];

export const buildRentContractFormGroups = (t: Translate): GroupConfig[] => [
  { group: 'renter_info', title: t('rent_contract.group_renter_info', 'investments') || 'Renter Information', columns: 2 },
  { group: 'contract_details', title: t('rent_contract.group_contract_details', 'investments') || 'Contract Details', columns: 2 },
];

export const buildRentContractDefaultValues = (contract: RentContract): Record<string, string | number | null | undefined> => ({
  renter_name: contract.renter_name,
  renter_phone: contract.renter_phone,
  rent_contract_number: contract.rent_contract_number,
  rent_contract_date: contract.rent_contract_date,
  rent_area: contract.rent_area,
  rent_contract_duration: contract.rent_contract_duration,
  rent_contract_industry_id: contract.rent_contract_industry_id ?? null,
});
