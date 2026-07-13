import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import type { BuildingLicense } from '../../../../domain/entities/buildinglicense';
import type { LicensingStatus } from '../../../../domain/entities/licensingStatus';
import type { ByDurationLicense } from '../../../../domain/entities/byDurationLicense';
import type { ByIndustryLicense } from '../../../../domain/entities/byIndustryLicense';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import { LoadingState } from '../../../../../../core/presentation/layouts/ui/state/LoadingState';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { GenericCreateForm, type FieldConfig } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { SectionCard } from '../../../../../../core/presentation/layouts/ui/card/SectionCard';
import { getCreateBuildingLicenseFormSchema } from '../../../schemas/buildingLicenseForm.schema';
import { getCreateLicensingStatusFormSchema } from '../../../schemas/licensingStatusForm.schema';
import { getCreateByDurationLicenseFormSchema } from '../../../schemas/byDurationLicenseForm.schema';
import { getCreateByIndustryLicenseFormSchema } from '../../../schemas/byIndustryLicenseForm.schema';
import { AuditLog } from '../../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { FileText, Plus, Eye, Pencil, Trash2, History } from 'lucide-react';
import { toast } from 'sonner';
import { getLocalizedName } from '../../../../../../core/presentation/utils/helpes';

interface BuildingLicenseSectionProps {
  facilityId: string;
}

export function BuildingLicenseSection({ facilityId }: BuildingLicenseSectionProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const baseUrl = `/investments/building-licenses`;
  const { entities: licenses, getAll: getLicenses, getById: getLicenseById, create: createLicense, update: updateLicense, remove: deleteLicense, loadingMap: licLoading, errorMap: licError } = useEntityCrud<BuildingLicense>(baseUrl, baseUrl);

  const { entities: licensingStatuses, getAll: getLicensingStatuses, create: createLicensingStatus } = useEntityCrud<LicensingStatus>('/investments/license-statuses', '/investments/license-statuses');
  const { entities: durationLicenses, getAll: getDurationLicenses, create: createDurationLicense } = useEntityCrud<ByDurationLicense>('/investments/by-duration-licenses', '/investments/by-duration-licenses');
  const { entities: industryLicenses, getAll: getIndustryLicenses, create: createIndustryLicense } = useEntityCrud<ByIndustryLicense>('/investments/by-industry-licenses', '/investments/by-industry-licenses');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<BuildingLicense | null>(null);
  const [fullLicense, setFullLicense] = useState<BuildingLicense | null>(null);
  const [viewingLicense, setViewingLicense] = useState<BuildingLicense | null>(null);
  const [fullViewLicense, setFullViewLicense] = useState<BuildingLicense | null>(null);
  const [deletingLicense, setDeletingLicense] = useState<BuildingLicense | null>(null);
  const [auditItem, setAuditItem] = useState<BuildingLicense | null>(null);

  const listUrl = `/investments/building-licenses?facility_id=${facilityId}`;

  useEffect(() => {
    if (facilityId) getLicenses(listUrl);
  }, [facilityId]);

  useEffect(() => {
    getLicensingStatuses();
    getDurationLicenses();
    getIndustryLicenses();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      const res = await createLicense({ ...data, facility_id: Number(facilityId) });
      toast.success(t('building_license.created', 'investments') || 'Building license created successfully');
      getLicenses(listUrl);
      setIsCreateOpen(false);
      return res;
    } catch (err: any) {
      toast.error(err?.message || t('building_license.create_error', 'investments') || 'Failed to create building license');
      throw err;
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingLicense) return;
    try {
      const res = await updateLicense(editingLicense.id, data);
      toast.success(t('building_license.updated', 'investments') || 'Building license updated successfully');
      getLicenses(listUrl);
      setEditingLicense(null);
      setFullLicense(null);
      return res;
    } catch (err: any) {
      toast.error(err?.message || t('building_license.update_error', 'investments') || 'Failed to update building license');
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deletingLicense) return;
    try {
      await deleteLicense(deletingLicense.id);
      toast.success(t('building_license.deleted', 'investments') || 'Building license deleted successfully');
      getLicenses(listUrl);
    } catch (err: any) {
      toast.error(err?.message || t('building_license.delete_error', 'investments') || 'Failed to delete building license');
    }
    setDeletingLicense(null);
  };

  const fields: FieldConfig[] = [
    { name: 'building_license_number', type: 'text', label: t('building_license.building_license_number', 'investments') || 'License Number', required: true },
    { name: 'building_license_date', type: 'date', label: t('building_license.building_license_date', 'investments') || 'License Date', required: true },
    { name: 'licensed_area', type: 'number', label: t('building_license.licensed_area', 'investments') || 'Licensed Area', required: true },
    {
      name: 'licensing_status_id',
      type: 'select-or-create',
      label: t('building_license.licensing_status_id', 'investments') || 'Licensing Status',
      required: true,
      options: licensingStatuses.map(s => ({ value: s.id, label: getLocalizedName(s.name), is_default: s.is_default })),
      createTitle: t('licensing_statuses.create', 'investments') || 'Create Licensing Status',
      labelPath: 'name',
      createButtonPermission: 'investments.license-statuses.create',
      renderCreateForm: (onSuccessForm, onCancelForm) => (
        <GenericCreateForm
          schema={getCreateLicensingStatusFormSchema(t)}
          fields={[
            { name: 'name', type: 'text', label: t('common.name', 'shared') || 'Name', required: true },
            { name: 'is_active', type: 'checkbox', label: t('licensing_statuses.is_active', 'investments') || 'Is Active' },
            { name: 'is_default', type: 'checkbox', label: t('licensing_statuses.is_default', 'investments') || 'Set as Default' },
          ]}
          onSubmit={createLicensingStatus}
          onSuccess={onSuccessForm}
          onCancel={onCancelForm}
          submitLabel={t('common.create', 'shared') || 'Create'}
        />
      ),
    },
    { name: 'date_of_displaying_license_info', type: 'date', label: t('building_license.date_of_displaying_license_info', 'investments') || 'Display Date', required: true },
    { name: 'administrative_license_decision_number', type: 'text', label: t('building_license.administrative_license_decision_number', 'investments') || 'Admin Decision #', required: true },
    { name: 'administrative_license_decision_date', type: 'date', label: t('building_license.administrative_license_decision_date', 'investments') || 'Admin Decision Date', required: true },
    {
      name: 'by_duration_license_id',
      type: 'select-or-create',
      label: t('building_license.by_duration_license_id', 'investments') || 'Duration License',
      required: true,
      options: durationLicenses.map(d => ({ value: d.id, label: getLocalizedName(d.name), is_default: d.is_default })),
      createTitle: t('by_duration_licenses.create', 'investments') || 'Create Duration License',
      labelPath: 'name',
      createButtonPermission: 'investments.by-duration-licenses.create',
      renderCreateForm: (onSuccessForm, onCancelForm) => (
        <GenericCreateForm
          schema={getCreateByDurationLicenseFormSchema(t)}
          fields={[
            { name: 'name', type: 'text', label: t('common.name', 'shared') || 'Name', required: true },
            { name: 'is_active', type: 'checkbox', label: t('by_duration_licenses.is_active', 'investments') || 'Is Active' },
            { name: 'is_default', type: 'checkbox', label: t('by_duration_licenses.is_default', 'investments') || 'Set as Default' },
          ]}
          onSubmit={createDurationLicense}
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
      options: industryLicenses.map(l => ({ value: l.id, label: getLocalizedName(l.name), is_default: l.is_default })),
      createTitle: t('by_industry_licenses.create', 'investments') || 'Create Industry License',
      labelPath: 'name',
      createButtonPermission: 'investments.by-industry-licenses.create',
      renderCreateForm: (onSuccessForm, onCancelForm) => (
        <GenericCreateForm
          schema={getCreateByIndustryLicenseFormSchema(t)}
          fields={[
            { name: 'name', type: 'text', label: t('common.name', 'shared') || 'Name', required: true },
            { name: 'is_active', type: 'checkbox', label: t('by_industry_licenses.is_active', 'investments') || 'Is Active' },
            { name: 'is_default', type: 'checkbox', label: t('by_industry_licenses.is_default', 'investments') || 'Set as Default' },
          ]}
          onSubmit={createIndustryLicense}
          onSuccess={onSuccessForm}
          onCancel={onCancelForm}
          submitLabel={t('common.create', 'shared') || 'Create'}
        />
      ),
    },
    { name: 'temp_administrative_license_expiration_date', type: 'date', label: t('building_license.temp_administrative_license_expiration_date', 'investments') || 'Temp Expiration Date', required: true },
  ];

  const columns = [
    { key: "building_license_number", label: t("building_license.building_license_number", "investments") || "License Number", width: 160 },
    { key: "building_license_date", label: t("building_license.building_license_date", "investments") || "License Date", width: 130 },
    { key: "licensed_area", label: t("building_license.licensed_area", "investments") || "Area", width: 100 },
    {
      key: "licensing_status",
      label: t("building_license.licensing_status_id", "investments") || "Licensing Status",
      width: 140,
      render: (row: BuildingLicense) => getLocalizedName(row.licensing_status?.name) || row.licensing_status_id || '—',
    },
    { key: "administrative_license_decision_number", label: t("building_license.administrative_license_decision_number", "investments") || "Admin Decision", width: 150 },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 130,
      render: (row: BuildingLicense) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={async () => { setViewingLicense(row); const res = await getLicenseById(row.id); if (res?.data) setFullViewLicense(res.data as BuildingLicense); }} title={t('common.view', 'shared') || 'View'} requiredPermission="investments.building-licenses.view">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={async () => { setEditingLicense(row); const res = await getLicenseById(row.id); if (res?.data) setFullLicense(res.data as BuildingLicense); }} title={t('common.edit', 'shared') || 'Edit'} requiredPermission="investments.building-licenses.update">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeletingLicense(row)} title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.building-licenses.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)} title={t('building_license.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      )
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

  return (
    <>
      <SectionCard
        title={t('building_license.title', 'investments') || 'Building Licenses'}
        icon={<FileText size={20} />}
      >
        <div className="flex items-center justify-between mb-4">
          <div />
          <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={16} />} requiredPermission="investments.building-licenses.create">
            {t('building_license.add', 'investments') || 'Add Building License'}
          </Button>
        </div>
        {licError["getAll"] ? (
          <ErrorState message={licError["getAll"]} onRetry={() => getLicenses(listUrl)} />
        ) : (
          <DataTable
            columns={columns}
            data={licenses}
            rowKey="id"
            loading={licLoading["getAll"]}
            emptyMessage={t('building_license.no_records', 'investments') || 'No building licenses found'}
          />
        )}
      </SectionCard>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('building_license.add', 'investments') || 'Add Building License'}>
        <GenericCreateForm
          schema={getCreateBuildingLicenseFormSchema(t)}
          fields={fields}
          onSubmit={handleCreate}
          onSuccess={() => setIsCreateOpen(false)}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('building_license.add', 'investments') || 'Add Building License'}
        />
      </Dialog>

      <Dialog isOpen={!!editingLicense} onClose={() => { setEditingLicense(null); setFullLicense(null); }} title={t('building_license.edit', 'investments') || 'Edit Building License'}>
        {editingLicense && licLoading["getById"] && !fullLicense && (
          <LoadingState message={t('common.loading', 'shared') || 'Loading...'} />
        )}
        {editingLicense && fullLicense && (
          <GenericCreateForm
            schema={getCreateBuildingLicenseFormSchema(t)}
            fields={fields}
            defaultValues={{
              building_license_number: fullLicense.building_license_number,
              building_license_date: normalizeDate(fullLicense.building_license_date),
              licensed_area: fullLicense.licensed_area,
              licensing_status_id: fullLicense.licensing_status?.id ?? fullLicense.licensing_status_id,
              date_of_displaying_license_info: normalizeDate(fullLicense.date_of_displaying_license_info),
              administrative_license_decision_number: fullLicense.administrative_license_decision_number,
              administrative_license_decision_date: normalizeDate(fullLicense.administrative_license_decision_date),
              by_duration_license_id: fullLicense.by_duration_license_id,
              by_industry_license_id: fullLicense.by_industry_license_id,
              temp_administrative_license_expiration_date: normalizeDate(fullLicense.temp_administrative_license_expiration_date),
            }}
            onSubmit={handleUpdate}
            onSuccess={() => { setEditingLicense(null); setFullLicense(null); }}
            onCancel={() => { setEditingLicense(null); setFullLicense(null); }}
            submitLabel={t('common.edit', 'shared') || 'Edit'}
          />
        )}
      </Dialog>

      <Dialog isOpen={!!viewingLicense} onClose={() => { setViewingLicense(null); setFullViewLicense(null); }} title={t('building_license.view', 'investments') || 'View Building License'} size="lg">
        {viewingLicense && licLoading["getById"] && !fullViewLicense && (
          <LoadingState message={t('common.loading', 'shared') || 'Loading...'} />
        )}
        {viewingLicense && fullViewLicense && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-text-muted">{t('building_license.building_license_number', 'investments') || 'License Number'}</span>
                <p className="font-medium">{fullViewLicense.building_license_number}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.building_license_date', 'investments') || 'License Date'}</span>
                <p className="font-medium">{fullViewLicense.building_license_date}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.licensed_area', 'investments') || 'Licensed Area'}</span>
                <p className="font-medium">{fullViewLicense.licensed_area}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.licensing_status_id', 'investments') || 'Licensing Status'}</span>
                <p className="font-medium">{getLocalizedName(fullViewLicense.licensing_status?.name) || fullViewLicense.licensing_status_id || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.date_of_displaying_license_info', 'investments') || 'Display Date'}</span>
                <p className="font-medium">{fullViewLicense.date_of_displaying_license_info}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.administrative_license_decision_number', 'investments') || 'Admin Decision #'}</span>
                <p className="font-medium">{fullViewLicense.administrative_license_decision_number}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.administrative_license_decision_date', 'investments') || 'Admin Decision Date'}</span>
                <p className="font-medium">{fullViewLicense.administrative_license_decision_date}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.by_duration_license_id', 'investments') || 'Duration License'}</span>
                <p className="font-medium">{fullViewLicense.by_duration_license_id}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.by_industry_license_id', 'investments') || 'Industry License'}</span>
                <p className="font-medium">{fullViewLicense.by_industry_license_id}</p>
              </div>
              <div>
                <span className="text-sm text-text-muted">{t('building_license.temp_administrative_license_expiration_date', 'investments') || 'Temp Expiration Date'}</span>
                <p className="font-medium">{fullViewLicense.temp_administrative_license_expiration_date}</p>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="building_license"
        modelId={auditItem?.id}
        module="investments"
        labels={{
          title: t('building_license.edit_log', 'investments') || 'Edit Log',
          event: t('building_license.event', 'investments') || 'Event',
          created_at: t('building_license.created_at', 'investments') || 'Created At',
          changed_by: t('building_license.changed_by', 'investments') || 'Changed By',
          changes: t('building_license.changes', 'investments') || 'Changes',
          field: t('building_license.field', 'investments') || 'Field',
          old_value: t('building_license.old_value', 'investments') || 'Old Value',
          new_value: t('building_license.new_value', 'investments') || 'New Value',
          no_records: t('building_license.no_edit_log', 'investments') || 'No edit logs found',
          subject_id: t('building_license.subject_id', 'investments') || 'Building License ID',
        }}
        translateField={(key) => t(`building_license.${key}`, 'investments') || key}
      />

      <ConfirmDialog
        isOpen={!!deletingLicense}
        title={t('building_license.delete_title', 'investments') || 'Delete Building License'}
        message={t('building_license.delete_message', 'investments') || 'Are you sure you want to delete this building license?'}
        onConfirm={handleDelete}
        onCancel={() => setDeletingLicense(null)}
        confirmLoading={licLoading["remove"]}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
      />
    </>
  );
}
