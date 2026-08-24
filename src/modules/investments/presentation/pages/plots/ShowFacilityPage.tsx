import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../core/presentation/hooks/data/useEntity';
import type { Facility } from '../../../domain/entities/facility';
import type { Dossier } from '../../../domain/entities/dossier';
import type { Plot } from '../../../domain/entities/plot';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { LoadingState } from '../../../../../core/presentation/layouts/ui/state/LoadingState';
import { ErrorState } from '../../../../../core/presentation/layouts/ui/state/ErrorState';
import { SectionCard } from '../../../../../core/presentation/layouts/ui/card/SectionCard';
import { InfoRow } from '../../../../../core/presentation/layouts/ui/card/InfoRow';
import { DossierDetailsSection } from './components/DossierDetailsSection';
import { PlotDetailsSection } from './components/PlotDetailsSection';
import { FacilityIndustrialLicensesSection } from './components/FacilityIndustrialLicensesSection';
import { AuditLog } from '../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { getLocalizedName } from '../../../../../core/presentation/utils/helpes';
import { ArrowRight, Factory, History, FolderOpen, Users } from 'lucide-react';
import { useStorage } from '../../../../../core/registry/storage/StorageProvider';
import { DataMatrixInput, type MatrixFieldConfig } from '../../../../../core/presentation/layouts/ui/inputs/DataMatrixInput';
import { authorizedPersonsPayloadToRows } from '../../forms/authorizedPersons';
import { buildProductionMatrixFields } from '../../forms/facilityFormConfig';
import type { ProductionCapacityRow, DailyConsumptionRow } from '../../../domain/entities/facility';
import type { ConsumptionMaterial } from '../../../domain/entities/consumptionMaterial';
import { BuildingLicenseSection } from './components/BuildingLicenseSection';

export function ShowFacilityPage() {
  const { t } = useLanguage();
  const { plotId, dossierId, facilityId } = useParams<{ plotId: string; dossierId: string; facilityId: string }>();
  const navigate = useNavigate();
  const storage = useStorage();

  const { getById } = useEntityCrud<Facility>(`/investments/facilities`, `/investments/facilities`);


  const { getById: getDossierById } = useEntityCrud<Dossier>(
    `/investments/plots/${plotId}/dossiers`,
    `/investments/plots/${plotId}/dossiers`
  );

  const { getById: getPlotById } = useEntityCrud<Plot>(
    `/investments/plots`,
    `/investments/plots`
  );

  const [facility, setFacility] = useState<Facility | null>(null);
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [plot, setPlot] = useState<Plot | null>(null);
  const [loading, setLoading] = useState(true);
  const [relationsLoading, setRelationsLoading] = useState(!!(plotId && dossierId));
  const [error, setError] = useState<string | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [fileExplorerOpen, setFileExplorerOpen] = useState(false);

  useEffect(() => {
    if (!facilityId) return;
    getById(Number(facilityId))
      .then((res) => {
        if (res?.data) setFacility(res.data);
        else setError(t('facilities.not_found', 'investments') || 'Facility not found');
      })
      .catch(() => setError(t('facilities.load_error', 'investments') || 'Failed to load facility'))
      .finally(() => setLoading(false));
  }, [facilityId]);

  useEffect(() => {
    if (!dossierId || !plotId) return;
    Promise.all([
      getDossierById(Number(dossierId)),
      getPlotById(Number(plotId)),
    ])
      .then(([dossierRes, plotRes]) => {
        if (dossierRes?.data) setDossier(dossierRes.data);
        if (plotRes?.data) setPlot(plotRes.data);
      })
      .catch(() => { })
      .finally(() => setRelationsLoading(false));
  }, [dossierId, plotId]);

  const handleBack = () => navigate(`/investments/plots/${plotId}/dossiers/${dossierId}`);

  if (loading) return <div className="p-6"><LoadingState message={t('common.loading', 'shared') || 'Loading...'} /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={() => window.location.reload()} /></div>;
  if (!facility) return null;

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'is_active') {
      return value === 'true' ? (t('common.yes', 'shared') || 'Yes') : value === 'false' ? (t('common.no', 'shared') || 'No') : value;
    }
    return value;
  };

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
          baseClasses='text-right'
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


  console.log(facility);

  const renderProductionMatrix = (title: string, rows?: ProductionCapacityRow[]) => {
    if (!rows || rows.length === 0) return null;
    console.log(rows);

    return (
      <div className="mb-4 last:mb-0">
        <h3 className="text-sm font-semibold text-text mb-2">{title}</h3>
        <DataMatrixInput baseClasses='text-right' value={rows} onChange={() => { }} disabled matrixFields={buildProductionMatrixFields(t)} maxRows={0} minRows={Infinity} />
      </div>
    );
  };

  return (
    <div className="p-6 w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowRight size={16} /> {t('facilities.back_to_dossier', 'investments') || 'Back to Dossier'}
          </Button>
          <h1 className="text-2xl font-bold">
            {t('facilities.view', 'investments') || 'View Facility'}
          </h1>
        </div>
        {storage?.FileExplorerDialogComponent && facility?.folder_id && (
          <Button variant="outline" onClick={() => setFileExplorerOpen(true)} requiredPermission="storage.storage.view" leftIcon={<FolderOpen size={16} />}>
            {t('facilities.folder', 'investments') || 'Facility Folder'}
          </Button>
        )}
      </div>

      <SectionCard
      // title={facility.name}
      // icon={<Factory size={20} />}
      >
        <div className='relative w-full flex justify-between items-center mb-6 pb-4'>
          <h2 className="text-lg font-bold text-text flex items-center gap-2 border-b border-border/50">
            <span className="text-primary"><Factory size={20} /></span>
            {t('facilities.view', 'investments') || 'View Facility'}
          </h2>
          <Button onClick={() => setIsAuditModalOpen(true)} variant="outline" size="sm" className="flex items-center gap-2" requiredPermission="shared.audit-logs.view">
            <History size={16} />
            {t('facilities.edit_log', 'investments') || 'سجل التعديل'}
          </Button>
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
        </div>
      </SectionCard>

      <SectionCard>
        <div className='relative w-full flex justify-between items-center mb-6 pb-4'>
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

      <SectionCard>
        <div className='relative w-full flex justify-between items-center mb-6 pb-4'>
          <h2 className="text-lg font-bold text-text flex items-center gap-2 border-b border-border/50">
            <span className="text-primary"><Users size={20} /></span>
            {t('facilities.authorized_persons', 'investments') || 'Authorized Persons'}
          </h2>
        </div>
        {facility.authorized_persons?.length ? (
          <DataMatrixInput
            baseClasses='text-right'
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
        ) : (
          <div className="text-sm text-muted-foreground">—</div>
        )}
      </SectionCard>
        
      <FacilityIndustrialLicensesSection facilityId={facilityId!} />
      <BuildingLicenseSection facilityId={facilityId!} />
      
      {plotId && dossierId &&
        (relationsLoading
          ? <div className="py-8"><LoadingState message={t('common.loading', 'shared') || 'Loading...'} /></div>
          : <DossierDetailsSection dossierId={dossierId} plotId={plotId} dossier={dossier} />
        )
      }
      {plotId &&
        (relationsLoading
          ? <div className="py-8"><LoadingState message={t('common.loading', 'shared') || 'Loading...'} /></div>
          : <PlotDetailsSection plotId={plotId} plot={plot} />
        )
      }

      <AuditLog
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        model="facility"
        modelId={Number(facilityId)}
        module="investments"
        labels={{
          title: t('facilities.edit_log', 'investments') || 'Edit Log',
          event: t('facilities.event', 'investments') || 'Event',
          created_at: t('facilities.created_at', 'investments') || 'Created At',
          changed_by: t('facilities.changed_by', 'investments') || 'Changed By',
          changes: t('facilities.changes', 'investments') || 'Changes',
          field: t('facilities.field', 'investments') || 'Field',
          old_value: t('facilities.old_value', 'investments') || 'Old Value',
          new_value: t('facilities.new_value', 'investments') || 'New Value',
          no_records: t('facilities.no_edit_log', 'investments') || 'No edit logs found',
          subject_id: t('facilities.subject_id', 'investments') || 'Facility ID',
        }}
        translateField={(key) => t(`facilities.${key}`, 'investments') || key}
        translateValues={handleTranslateValues}
      />

      {storage?.FileExplorerDialogComponent && facility?.folder_id &&
        <storage.FileExplorerDialogComponent isOpen={fileExplorerOpen} onClose={() => { setFileExplorerOpen(false) }} folderId={facility.folder_id} />
      }
    </div>
  );
}
