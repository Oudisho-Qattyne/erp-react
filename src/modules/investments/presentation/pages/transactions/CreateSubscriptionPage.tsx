import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { GenericCreateForm, type FieldConfig, type GroupConfig } from '../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import type { EntityWithNameOnly } from '../../../../../core/domain/entities/EntityWithNameOnly';
import { getLocalizedName } from '../../../../../core/presentation/utils/helpes';
import { handleApiError } from '../../../../../core/presentation/utils/handleApiError';
import { isApiError } from '../../../../../core/domain/common/errors/ApiError';
import { getCreateFacilityFormSchema } from '../../schemas/facilityForm.schema';
import { getInvestorRowSchema } from '../../schemas/investorForm.schema';
import { buildFacilityFormFields, buildFacilityFormGroups } from '../../forms/facilityFormConfig';
import { InvestorsField } from '../../forms/InvestorsInput';
import type { PartnershipType } from '../../../domain/entities/partnershipType';
import type { Country } from '../../../../../core/domain/entities/regions/Country';
import { useSubscription } from '../../hooks/useSubscription';
import { mapSubscriptionServerValidationErrors } from '../../forms/subscriptionServerErrors';
import type { CreateSubscriptionDTO, SubscriptionAuthorizedPersonPayload, SubscriptionInvestorPayload } from '../../../domain/repositories/ISubscriptionRepository';
import type { ProductionCapacityRow } from '../../../domain/entities/facility';
import type { ConsumptionMaterial } from '../../../domain/entities/consumptionMaterial';
import { PlotPickerDialog } from '../plots/components/PlotPickerDialog';

export function CreateSubscriptionPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const partnershipTypesCrud = useEntityCrud<PartnershipType>('/investments/partnership-types', '/investments/partnership-types');
  const countriesCrud = useEntityCrud<Country>('/shared-kernal/countries', '/shared-kernal/countries');
  const consumptionMaterialsCrud = useEntityCrud<ConsumptionMaterial>('/investments/consumable-materials', '/investments/consumable-materials');
  const plotAreasCrud = useEntityCrud<EntityWithNameOnly>('/investments/plot-areas', '/investments/plot-areas');
  const plotClassificationsCrud = useEntityCrud<EntityWithNameOnly>('/investments/plot-classifications', '/investments/plot-classifications');
  const { createSubscription } = useSubscription();

  useEffect(() => {
    partnershipTypesCrud.getAll('/investments/partnership-types?is_active=true');
    consumptionMaterialsCrud.getAll('/investments/consumable-materials?is_active=true');
    plotAreasCrud.getAll();
    plotClassificationsCrud.getAll();
  }, []);

  const facilityDeps = {
    partnershipTypes: partnershipTypesCrud.entities,
    createPartnershipType: partnershipTypesCrud.create,
    countries: countriesCrud.entities,
    loadCountries: countriesCrud.getAll,
    createCountry: countriesCrud.create,
    consumptionMaterials: consumptionMaterialsCrud.entities,
    loadConsumptionMaterials: consumptionMaterialsCrud.getAll,
    createConsumptionMaterial: consumptionMaterialsCrud.create,
  };

  const fields: FieldConfig[] = [
    {
      name: 'plot_id',
      label: t('transactions.plot', 'investments') || 'Plot',
      type: 'table-picker',
      required: true,
      group: 'plot',
      picker: PlotPickerDialog,
      labelKey: 'code',
    },
    {
      name: 'investors',
      label: t('transactions.partners', 'investments') || 'Partners',
      group: 'partners',
      render: (methods) => <InvestorsField methods={methods} />,
    },
    ...buildFacilityFormFields(t, facilityDeps),
  ];

  const groups: GroupConfig[] = [
    {
      group: 'plot',
      title: t('transactions.group_plot', 'investments') || 'Plot Selection',
      columns: 1,
      rows: [['plot_id']],
    },
    {
      group: 'partners',
      title: t('transactions.group_partners', 'investments') || 'Partners',
      columns: 1,
      rows: [['investors']],
    },
    {
      group: 'facility',
      title: t('facilities.title', 'investments') || 'Facility',
      children: buildFacilityFormGroups(t),
    },
  ];

  const schema = getCreateFacilityFormSchema(t).extend({
    plot_id: z.number( t('transactions.validation.plot_required', 'investments') || 'Plot is required' ),
    investors: z.array(getInvestorRowSchema(t)).min(1, t('transactions.validation.investors_required', 'investments') || 'At least one investor is required'),
  });

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      const plotId = Number(data.plot_id);
      const payload: CreateSubscriptionDTO = {
        facility: {
          name: String(data.name ?? ''),
          partnership_type_id: (data.partnership_type_id as number | null) ?? null,
          address: String(data.address ?? ''),
          company_type: String(data.company_type ?? ''),
          commercial_register: (data.commercial_register as string | null | undefined) ?? null,
          commercial_register_date: (data.commercial_register_date as string | null | undefined) ?? null,
          company_nationality_id: (data.company_nationality_id as number | null) ?? null,
          first_phone_number: String(data.first_phone_number ?? ''),
          second_phone_number: (data.second_phone_number as string) || null,
          email: (data.email as string) || null,
          total_capital_in_usd: Number(data.total_capital_in_usd),
          total_capital_in_syp: Number(data.total_capital_in_syp),
          value_of_machines_in_usd: Number(data.value_of_machines_in_usd),
          value_of_machines_in_syp: Number(data.value_of_machines_in_syp),
          number_of_workers: Number(data.number_of_workers),
          number_or_patrols: (data.number_or_patrols as number | null) ?? null,
          telephone_lines_number: (data.telephone_lines_number as number | null) ?? null,
          monthly_internet_data_requirement: (data.monthly_internet_data_requirement as number | null) ?? null,
          yearly_imported_raw_materials: (data.yearly_imported_raw_materials as string | null | undefined) ?? null,
          export_to_production_ratio: (data.export_to_production_ratio as number | null) ?? null,
          daily_production_capacities: (data.daily_production_capacities as ProductionCapacityRow[] | undefined) ?? [],
          monthly_production_capacities: (data.monthly_production_capacities as ProductionCapacityRow[] | undefined) ?? [],
          yearly_production_capacities: (data.yearly_production_capacities as ProductionCapacityRow[] | undefined) ?? [],
          daily_consumption: ((data.daily_consumption as { material: number; consumption: string }[] | undefined) ?? []).map(row => ({ id: row.material, consumption: row.consumption })),
          electrical_power_capacity: String(data.electrical_power_capacity ?? ''),
          yearly_estimated_drinking_water_consumption: Number(data.yearly_estimated_drinking_water_consumption),
          yearly_estimated_industrial_water_consumption: Number(data.yearly_estimated_industrial_water_consumption),
          require_all_persons_for_legal_matters: Boolean(data.require_all_persons_for_legal_matters),
        },
        authorized_persons: ((data.authorized_persons as SubscriptionAuthorizedPersonPayload[] | undefined) ?? []),
        partners: ((data.investors as SubscriptionInvestorPayload[] | undefined) ?? []).map((investor) => ({ investor })),
      };
      await createSubscription(plotId, payload);
      navigate('/investments/plots');
      return { data: { id: plotId } };
    } catch (err: unknown) {
      handleApiError(err, { module: 'investments' , passThrough:true });
      if (isApiError(err) && err.validationErrors) {
        err.validationErrors = mapSubscriptionServerValidationErrors(err.validationErrors);
      }
      throw err;
    }
  };

  return (
    <div className="p-6 w-full mx-auto space-y-6" dir="auto">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate('/investments/transactions')}>
          {t('common.back', 'shared') || 'Back'}
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Coins size={24} className="text-primary" />
          {t('transactions.create_title', 'investments') || 'New Subscription'}
        </h1>
      </div>

      <div className='relative w-full'>
        <GenericCreateForm
          schema={schema}
          fields={fields}
          groups={groups}
          defaultValues={{ require_all_persons_for_legal_matters: true }}
          onSubmit={handleSubmit}
          onSuccess={() => {}}
          onCancel={() => navigate('/investments/transactions')}
          submitLabel={t('common.save', 'shared') || 'Save'}
        />
      </div>
    </div>
  );
}