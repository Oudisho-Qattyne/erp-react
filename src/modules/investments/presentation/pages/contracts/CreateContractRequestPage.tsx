import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSignature, ArrowLeft, Factory, Users } from 'lucide-react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Facility, ProductionCapacityRow, DailyConsumptionRow } from '../../../domain/entities/facility';
import type { Dossier } from '../../../domain/entities/dossier';
import type { Plot } from '../../../domain/entities/plot';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { SectionCard } from '../../../../../core/presentation/layouts/ui/card/SectionCard';
import { InfoRow } from '../../../../../core/presentation/layouts/ui/card/InfoRow';
import { Toggle } from '../../../../../core/presentation/layouts/ui/inputs/Toggle';
import { TablePickerInput } from '../../../../../core/presentation/layouts/ui/inputs/TablePickerInput';
import { DataMatrixInput, type MatrixFieldConfig } from '../../../../../core/presentation/layouts/ui/inputs/DataMatrixInput';
import { DataTable, type ColumnDef } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { GenericCreateForm, type FieldConfig, type GroupConfig } from '../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { DossierDetailsSection } from '../plots/components/DossierDetailsSection';
import { PlotDetailsSection } from '../plots/components/PlotDetailsSection';
import { FacilityPickerDialog } from '../plots/components/FacilityPickerDialog';
import { getLocalizedName } from '../../../../../core/presentation/utils/helpes';
import { authorizedPersonsPayloadToRows } from '../../forms/authorizedPersons';
import { buildProductionMatrixFields } from '../../forms/facilityFormConfig';
import { getCreateContractFormSchema } from '../../schemas/contractForm.schema';
import { buildContractFormFields } from '../../forms/contractFormConfig';

export function CreateContractRequestPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [facilityId, setFacilityId] = useState<number | null>(null);
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [attendedKeys, setAttendedKeys] = useState<number[]>([]);

  const { getById: getFacilityById } = useEntityCrud<Facility>('/investments/facilities', '/investments/facilities');

  const loadFacility = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    setFacility(null);
    try {
      const res = await getFacilityById(id);
      if (res?.data) setFacility(res.data);
      else setError(t('facilities.not_found', 'investments') || 'Facility not found');
    } catch {
      setError(t('facilities.load_error', 'investments') || 'Failed to load facility');
    } finally {
      setLoading(false);
    }
  }, [getFacilityById, t]);

  useEffect(() => {
    if (facilityId == null) return;
    loadFacility(facilityId);
  }, [facilityId, loadFacility]);

  const renderConsumptionMatrix = (rows?: DailyConsumptionRow[]) => {
    if (!rows || rows.length === 0) return null;

    const consumptionFields: MatrixFieldConfig[] = [
      {
        name: 'id',
        type: 'text',
        label: t('facilities.consumption_material', 'investments') || 'Material',
      },
      { name: 'consumption', type: 'text', label: t('facilities.consumption_value', 'investments') || 'Consumption' },
      { name: 'unit', type: 'text', label: t('facilities.consumption_unit', 'investments') || 'Unit', disabled: true },
    ];

    return (
      <div className="mb-4 last:mb-0">
        <h3 className="text-sm font-semibold text-text mb-2">{t('facilities.daily_consumption', 'investments') || 'Daily Consumption Volume'}</h3>
        <DataMatrixInput
          baseClasses="text-right"
          maxRows={0}
          minRows={Infinity}
          value={rows.map((row) => ({ id: row.consumable_material?.name, consumption: String(row.consumption), unit: row.consumable_material?.unit }))}
          onChange={() => { }}
          disabled
          matrixFields={consumptionFields}
        />
      </div>
    );
  };

  const renderProductionMatrix = (title: string, rows?: ProductionCapacityRow[]) => {
    if (!rows || rows.length === 0) return null;
    return (
      <div className="mb-4 last:mb-0">
        <h3 className="text-sm font-semibold text-text mb-2">{title}</h3>
        <DataMatrixInput baseClasses="text-right" value={rows} onChange={() => { }} disabled matrixFields={buildProductionMatrixFields(t)} maxRows={0} minRows={Infinity} />
      </div>
    );
  };

  interface AttendedRow {
    id: number;
    name: string;
    email: string;
    primary_phone_number: string;
    whatsapp: string;
    role_in_facility: string;
    is_required_for_legal_matters: boolean;
  }

  const authRows = useMemo<AttendedRow[]>(
    () =>
      (facility?.authorized_persons ?? []).map((a) => ({
        id: a.person.id,
        name: a.person.name,
        email: a.person.email ?? '',
        primary_phone_number: a.person.primary_phone_number ?? '',
        whatsapp: a.person.whatsapp ?? '',
        role_in_facility: a.role_in_facility ?? '',
        is_required_for_legal_matters: a.is_required_for_legal_matters,
      })),
    [facility]
  );

  const authColumns: ColumnDef<AttendedRow>[] = [
    { key: 'id', label: t('common.id', 'shared') || '#', width: 80, align: 'center' },
    { key: 'name', label: t('facilities.authorized_persons_person', 'investments') || 'Name', width: 160 },
    { key: 'email', label: t('facilities.email', 'investments') || 'Email', width: 150 },
    { key: 'primary_phone_number', label: t('facilities.authorized_persons_primary_phone', 'investments') || 'Primary Phone', width: 100 },
    { key: 'whatsapp', label: t('facilities.authorized_persons_whatsapp', 'investments') || 'WhatsApp', width: 100 },
    { key: 'role_in_facility', label: t('facilities.authorized_persons_role', 'investments') || 'Role in Facility', width: 100 },
    {
      key: 'is_required_for_legal_matters',
      label: t('facilities.authorized_persons_required_label', 'investments') || 'Required',
      width: 50,
      align: 'center',
      render: (row) =>
        row.is_required_for_legal_matters ? (t('common.yes', 'shared') || 'Yes') : (t('common.no', 'shared') || 'No'),
    },
    {
      key: 'attended',
      label: t('contract.attended', 'investments') || 'Attended',
      width: 100,
      align: 'center',
      render: (row) => (
        <Toggle
          size="sm"
          variant="success"
          value={attendedKeys.includes(row.id)}
          onChange={(v) =>
            setAttendedKeys((prev) => (v ? [...prev, row.id] : prev.filter((k) => k !== row.id)))
          }
          aria-label={`${row.name}: ${t('contract.attended', 'investments') || 'Attended'}`}
        />
      ),
    },
  ];

  const contractFields: FieldConfig[] = buildContractFormFields(t).map((f) => ({ ...f, group: 'contract' }));
  if (facility) {

    console.log(facility.plot_id, facility.plot_dossier_id, facility.plot_dossier);
  }

  const contractGroups: GroupConfig[] = [
    {
      group: 'contract',
      title: t('contract.section_title', 'investments') || 'Contract',
      columns: 2,
      rows: [
        ['contract_number', 'contract_date'],
        ['unit_price_per_square_meter', 'weighting_factor'],
        ['payment_method'],
      ],
    },
  ];

  const handleContractSubmit = async (data: Record<string, unknown>): Promise<{ data: { id: number | null } }> => {
    void data;
    return { data: { id: null } };
  };

  return (
    <div className="p-6 w-full mx-auto space-y-6" dir="auto">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate('/investments/transactions')}>
          {t('common.back', 'shared') || 'Back'}
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileSignature size={24} className="text-primary" />
          {t('transactions.create_contract_title', 'investments') || 'New Contract Request'}
        </h1>
      </div>


      <SectionCard
        title={t('facilities.picker_title', 'investments') || 'Select Facility'}
        icon={<Factory size={20} />}
      >
        <div >
          <TablePickerInput
            value={facilityId}
            onChange={setFacilityId}
            picker={FacilityPickerDialog}
            valueKey="id"
            labelKey="name"
            displayLabel={(value) => facility?.name ?? `#${String(value)}`}
            placeholder={t('facilities.picker_title', 'investments') || 'Select Facility'}
            onSelectionChange={(items) => {
              const picked = items?.[0];
              setFacility(picked ?? null);
            }}
            baseClasses="w-full"
          />
        </div>
      </SectionCard>


      {facilityId != null && (
        loading ? (
          <div className="py-8"><LoadingState message={t('common.loading', 'shared') || 'Loading...'} /></div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => facilityId != null && loadFacility(facilityId)} />
        ) : facility ? (
          <>
            <PlotDetailsSection plot={facility.plot} />
            <DossierDetailsSection dossier={facility.plot_dossier} />
            <SectionCard>
              <div className="relative w-full flex justify-between items-center mb-6 pb-4">
                <h2 className="text-lg font-bold text-text flex items-center gap-2 border-b border-border/50">
                  <span className="text-primary"><Factory size={20} /></span>
                  {facility.name}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoRow label={t('facilities.name', 'investments') || 'Name'} value={facility.name} />
                <InfoRow label={t('facilities.partnership_type_name', 'investments') || 'Partnership Type Name'} value={facility.partnership_type ? getLocalizedName(facility.partnership_type.name) : '—'} />
                <InfoRow label={t('facilities.address', 'investments') || 'Address'} value={facility.address} />
                <InfoRow
                  label={t('facilities.company_type', 'investments') || 'Company Type'}
                  value={
                    facility.company_type === 'existing'
                      ? t('facilities.company_type_existing', 'investments') || 'Existing'
                      : facility.company_type === 'under_incorporation'
                        ? t('facilities.company_type_under_incorporation', 'investments') || 'Under Incorporation'
                        : '—'
                  }
                />
                <InfoRow label={t('facilities.commercial_register', 'investments') || 'Commercial Register'} value={facility.commercial_register || '—'} />
                <InfoRow label={t('facilities.commercial_register_date', 'investments') || 'Commercial Register Date'} value={facility.commercial_register_date || '—'} />
                <InfoRow label={t('facilities.company_nationality', 'investments') || 'Company Nationality'} value={facility.company_nationality ? getLocalizedName(facility.company_nationality.name) : '—'} />
                <InfoRow label={t('facilities.first_phone_number', 'investments') || 'Phone'} value={facility.first_phone_number} />
                <InfoRow label={t('facilities.second_phone_number', 'investments') || 'Phone 2'} value={facility.second_phone_number || '—'} />
                <InfoRow label={t('facilities.email', 'investments') || 'Email'} value={facility.email || '—'} />
                <InfoRow label={t('facilities.number_of_workers', 'investments') || 'Workers'} value={facility.number_of_workers ?? '—'} />
                <InfoRow label={t('facilities.number_or_patrols', 'investments') || 'Number of Patrols'} value={facility.number_or_patrols ?? '—'} />
                <InfoRow label={t('facilities.telephone_lines_number', 'investments') || 'Telephone Lines Number'} value={facility.telephone_lines_number ?? '—'} />
                <InfoRow label={t('facilities.yearly_imported_raw_materials', 'investments') || 'Yearly Imported Raw Materials'} value={facility.yearly_imported_raw_materials || '—'} />
                <InfoRow label={t('facilities.total_capital_in_syp', 'investments') || 'Capital (SYP)'} value={facility.total_capital_in_syp ?? '—'} />
                <InfoRow label={t('facilities.total_capital_in_usd', 'investments') || 'Capital (USD)'} value={facility.total_capital_in_usd ?? '—'} />
                <InfoRow label={t('facilities.value_of_machines_in_syp', 'investments') || 'Machinery Value (SYP)'} value={facility.value_of_machines_in_syp ?? '—'} />
                <InfoRow label={t('facilities.value_of_machines_in_usd', 'investments') || 'Machinery Value (USD)'} value={facility.value_of_machines_in_usd ?? '—'} />
                <InfoRow label={t('facilities.export_to_production_ratio', 'investments') || 'Export to Production Ratio'} value={facility.export_to_production_ratio ?? '—'} />
                <InfoRow label={t('facilities.electrical_power_capacity', 'investments') || 'Power Capacity'} value={facility.electrical_power_capacity || '—'} />
                <InfoRow label={t('facilities.monthly_internet_data_requirement', 'investments') || 'Monthly Internet Data Requirement'} value={facility.monthly_internet_data_requirement ?? '—'} />
                <InfoRow label={t('facilities.yearly_estimated_drinking_water_consumption', 'investments') || 'Drinking Water Consumption'} value={facility.yearly_estimated_drinking_water_consumption ?? '—'} />
                <InfoRow label={t('facilities.yearly_estimated_industrial_water_consumption', 'investments') || 'Industrial Water Consumption'} value={facility.yearly_estimated_industrial_water_consumption ?? '—'} />
                <InfoRow
                  label={t('facilities.require_all_persons_for_legal_matters', 'investments') || 'Require All Persons for Legal Matters'}
                  value={facility.require_all_persons_for_legal_matters ? (t('common.yes', 'shared') || 'Yes') : (t('common.no', 'shared') || 'No')}
                />
              </div>
            </SectionCard>

            {(facility.daily_production_capacities?.length || facility.monthly_production_capacities?.length || facility.yearly_production_capacities?.length || facility.daily_consumption?.length) ? (
              <SectionCard>
                <div className="relative w-full flex justify-between items-center mb-6 pb-4">
                  <h2 className="text-lg font-bold text-text flex items-center gap-2 border-b border-border/50">
                    <span className="text-primary"><Factory size={20} /></span>
                    {t('facilities.group_production', 'investments') || 'Production Capacity'}
                  </h2>
                </div>
                <div className="space-y-6">
                  {renderProductionMatrix(t('facilities.daily_production_capacities', 'investments') || 'Daily Capacity', facility.daily_production_capacities)}
                  {renderProductionMatrix(t('facilities.monthly_production_capacities', 'investments') || 'Monthly Capacity', facility.monthly_production_capacities)}
                  {renderProductionMatrix(t('facilities.yearly_production_capacities', 'investments') || 'Annual Capacity', facility.yearly_production_capacities)}
                  {renderConsumptionMatrix(facility.daily_consumption)}
                </div>
              </SectionCard>
            ) : null}

            {facility.authorized_persons?.length ? (
              <SectionCard>
                <div className="relative w-full flex justify-between items-center mb-6 pb-4">
                  <h2 className="text-lg font-bold text-text flex items-center gap-2 border-b border-border/50">
                    <span className="text-primary"><Users size={20} /></span>
                    {t('facilities.authorized_persons', 'investments') || 'Authorized Persons'}
                  </h2>
                </div>
                <DataMatrixInput
                  baseClasses="text-right"
                  maxRows={0}
                  minRows={Infinity}
                  value={authorizedPersonsPayloadToRows(facility.authorized_persons)}
                  onChange={() => { }}
                  disabled
                  matrixFields={[
                    { name: 'id', label: 'ID', type: 'numeric', disabled: true },
                    { name: 'name', label: t('facilities.authorized_persons_person', 'investments') || 'Person (name / email / phone)', type: 'text' },
                    { name: 'email', label: t('facilities.email', 'investments') || 'Email', type: 'text' },
                    { name: 'primary_phone_number', label: t('facilities.authorized_persons_primary_phone', 'investments') || 'Primary Phone', type: 'text' },
                    { name: 'whatsapp', label: t('facilities.authorized_persons_whatsapp', 'investments') || 'WhatsApp', type: 'text' },
                    { name: 'facebook', label: t('facilities.authorized_persons_facebook', 'investments') || 'Facebook', type: 'text' },
                    { name: 'role_in_facility', label: t('facilities.authorized_persons_role', 'investments') || 'Role in Facility', type: 'text' },
                    { name: 'is_required_for_legal_matters', label: t('facilities.authorized_persons_required_label', 'investments') || 'Required', type: 'checkbox', defaultValue: true },
                  ]}
                />
              </SectionCard>
            ) : null}


<SectionCard
        title={t('contract.attended_persons', 'investments') || 'Attended Persons'}
        icon={<Users size={20} />}
      >
        <DataTable
          columns={authColumns}
          data={authRows}
          rowKey="id"
          onRowClick={() => { }}
          emptyMessage={t('contract.no_authorized_persons', 'investments') || 'No authorized persons for the selected facility.'}
        />
      </SectionCard>
            <SectionCard
              title={t('contract.section_title', 'investments') || 'Contract'}
              icon={<FileSignature size={20} />}
            >
              <div className="relative w-full">
                <GenericCreateForm
                  schema={getCreateContractFormSchema(t)}
                  fields={contractFields}
                  groups={contractGroups}
                  onSubmit={handleContractSubmit}
                  onSuccess={() => { }}
                  onCancel={() => navigate('/investments/transactions')}
                  submitLabel={t('common.save', 'shared') || 'Save'}
                />
              </div>
            </SectionCard>


          </>
        ) : null
      )}

    </div>
  );
}