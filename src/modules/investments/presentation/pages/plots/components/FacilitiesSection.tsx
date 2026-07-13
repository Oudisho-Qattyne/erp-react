import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import type { Facility } from '../../../../domain/entities/facility';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { GenericCreateForm, type FieldConfig } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { SectionCard } from '../../../../../../core/presentation/layouts/ui/card/SectionCard';
import { getCreateFacilityFormSchema } from '../../../schemas/facilityForm.schema';
import { AuditLog } from '../../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { Factory, Plus, Eye, Pencil, Trash2, History } from 'lucide-react';
import { toast } from 'sonner';

interface FacilitiesSectionProps {
  plotId: string;
  dossierId: string;
}

export function FacilitiesSection({ plotId, dossierId }: FacilitiesSectionProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const baseUrl = `/investments/facilities`;
  const { entities: facilities, getAll: getFacilities, create: createFacility, update: updateFacility, remove: deleteFacility, loadingMap: facLoading, errorMap: facError } = useEntityCrud<Facility>(baseUrl, baseUrl);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [deletingFacility, setDeletingFacility] = useState<Facility | null>(null);
  const [auditItem, setAuditItem] = useState<Facility | null>(null);

  const listUrl = `/investments/facilities?plot_id=${plotId}&plot_dossier_id=${dossierId}`;

  useEffect(() => {
    if (dossierId && plotId) getFacilities(listUrl);
  }, [dossierId, plotId]);

  const handleCreate = async (data: any) => {
    try {
      const res = await createFacility({ ...data, plot_id: Number(plotId), plot_dossier_id: Number(dossierId) });
      toast.success(t('facilities.created', 'investments') || 'Facility created successfully');
      getFacilities(listUrl);
      setIsCreateOpen(false);
      return res;
    } catch (err: any) {
      toast.error(err?.message || t('facilities.create_error', 'investments') || 'Failed to create facility');
      throw err;
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingFacility) return;
    try {
      const res = await updateFacility(editingFacility.id, data);
      toast.success(t('facilities.updated', 'investments') || 'Facility updated successfully');
      getFacilities(listUrl);
      setEditingFacility(null);
      return res;
    } catch (err: any) {
      toast.error(err?.message || t('facilities.update_error', 'investments') || 'Failed to update facility');
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deletingFacility) return;
    try {
      await deleteFacility(deletingFacility.id);
      toast.success(t('facilities.deleted', 'investments') || 'Facility deleted successfully');
      getFacilities(listUrl);
    } catch (err: any) {
      toast.error(err?.message || t('facilities.delete_error', 'investments') || 'Failed to delete facility');
    }
    setDeletingFacility(null);
  };

  const fields: FieldConfig[] = [
    { name: 'name', type: 'text', label: t('facilities.name', 'investments') || 'Name', required: true },
    { name: 'address', type: 'text', label: t('facilities.address', 'investments') || 'Address', required: true },
    { name: 'city', type: 'text', label: t('facilities.city', 'investments') || 'City', required: true },
    { name: 'first_phone_number', type: 'text', label: t('facilities.first_phone_number', 'investments') || 'Phone', required: true },
    { name: 'second_phone_number', type: 'text', label: t('facilities.second_phone_number', 'investments') || 'Phone 2' },
    { name: 'email', type: 'email', label: t('facilities.email', 'investments') || 'Email' },
    { name: 'capital_in_syp', type: 'number', label: t('facilities.capital_in_syp', 'investments') || 'Capital (SYP)', required: true },
    { name: 'capital_in_usd', type: 'number', label: t('facilities.capital_in_usd', 'investments') || 'Capital (USD)', required: true },
    { name: 'value_of_machines_in_syp', type: 'number', label: t('facilities.value_of_machines_in_syp', 'investments') || 'Machinery Value (SYP)', required: true },
    { name: 'value_of_machines_in_usd', type: 'number', label: t('facilities.value_of_machines_in_usd', 'investments') || 'Machinery Value (USD)', required: true },
    { name: 'number_of_workers', type: 'number', label: t('facilities.number_of_workers', 'investments') || 'Workers', required: true },
    { name: 'daily_production_capacity', type: 'number', label: t('facilities.daily_production_capacity', 'investments') || 'Daily Capacity', required: true },
    { name: 'monthly_production_capacity', type: 'number', label: t('facilities.monthly_production_capacity', 'investments') || 'Monthly Capacity', required: true },
    { name: 'yearly_production_capacity', type: 'number', label: t('facilities.yearly_production_capacity', 'investments') || 'Annual Capacity', required: true },
    { name: 'electrical_power_capacity', type: 'text', label: t('facilities.electrical_power_capacity', 'investments') || 'Power Capacity', required: true },
    { name: 'yearly_estimated_water_consumption', type: 'number', label: t('facilities.yearly_estimated_water_consumption', 'investments') || 'Water Consumption', required: true },
  ];

  const columns = [
    { key: "name", label: t("facilities.name", "investments") || "Name", width: 180 },
    { key: "city", label: t("facilities.city", "investments") || "City", width: 120 },
    { key: "first_phone_number", label: t("facilities.first_phone_number", "investments") || "Phone", width: 130 },
    { key: "email", label: t("facilities.email", "investments") || "Email", width: 180 },
    { key: "number_of_workers", label: t("facilities.number_of_workers", "investments") || "Workers", width: 100 },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 130,
      render: (row: Facility) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/investments/plots/${plotId}/dossiers/${dossierId}/facilities/${row.id}`)} title={t('common.view', 'shared') || 'View'} requiredPermission="investments.facilities.view">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditingFacility(row)} title={t('common.edit', 'shared') || 'Edit'} requiredPermission="investments.facilities.update">
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeletingFacility(row)} title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.facilities.delete">
            <Trash2 size={16} className="text-danger" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)} title={t('facilities.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      )
    },
  ];

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'is_active') {
      return value === 'true' ? (t('common.yes', 'shared') || 'Yes') : value === 'false' ? (t('common.no', 'shared') || 'No') : value;
    }
    return value;
  };

  return (
    <>
      <SectionCard
        title={t('facilities.title', 'investments') || 'Facilities'}
        icon={<Factory size={20} />}
      >
        <div className="flex items-center justify-between mb-4">
          <div />
          <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={16} />} requiredPermission="investments.facilities.create">
            {t('facilities.add', 'investments') || 'Add Facility'}
          </Button>
        </div>
        {facError["getAll"] ? (
          <ErrorState message={facError["getAll"]} onRetry={() => getFacilities(listUrl)} />
        ) : (
          <DataTable
            columns={columns}
            data={facilities}
            rowKey="id"
            loading={facLoading["getAll"]}
            emptyMessage={t('facilities.no_records', 'investments') || 'No facilities found'}
          />
        )}
      </SectionCard>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('facilities.add', 'investments') || 'Add Facility'}>
        <GenericCreateForm
          schema={getCreateFacilityFormSchema(t)}
          fields={fields}
          onSubmit={handleCreate}
          onSuccess={() => setIsCreateOpen(false)}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('facilities.add', 'investments') || 'Add Facility'}
        />
      </Dialog>

      <Dialog isOpen={!!editingFacility} onClose={() => setEditingFacility(null)} title={t('facilities.edit', 'investments') || 'Edit Facility'}>
        {editingFacility && (
          <GenericCreateForm
            schema={getCreateFacilityFormSchema(t)}
            fields={fields}
            defaultValues={{
              name: editingFacility.name,
              address: editingFacility.address,
              city: editingFacility.city,
              first_phone_number: editingFacility.first_phone_number,
              second_phone_number: editingFacility.second_phone_number ?? null,
              email: editingFacility.email || '',
              capital_in_syp: editingFacility.capital_in_syp,
              capital_in_usd: editingFacility.capital_in_usd,
              value_of_machines_in_syp: editingFacility.value_of_machines_in_syp,
              value_of_machines_in_usd: editingFacility.value_of_machines_in_usd,
              number_of_workers: editingFacility.number_of_workers,
              daily_production_capacity: editingFacility.daily_production_capacity,
              monthly_production_capacity: editingFacility.monthly_production_capacity,
              yearly_production_capacity: editingFacility.yearly_production_capacity,
              electrical_power_capacity: String(editingFacility.electrical_power_capacity ?? ''),
              yearly_estimated_water_consumption: editingFacility.yearly_estimated_water_consumption,
            }}
            onSubmit={handleUpdate}
            onSuccess={() => setEditingFacility(null)}
            onCancel={() => setEditingFacility(null)}
            submitLabel={t('common.edit', 'shared') || 'Edit'}
          />
        )}
      </Dialog>

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="facility"
        modelId={auditItem?.id}
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

      <ConfirmDialog
        isOpen={!!deletingFacility}
        title={t('facilities.delete_title', 'investments') || 'Delete Facility'}
        message={t('facilities.delete_message', 'investments') || 'Are you sure you want to delete this facility?'}
        onConfirm={handleDelete}
        onCancel={() => setDeletingFacility(null)}
        confirmLoading={facLoading["remove"]}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
      />
    </>
  );
}
