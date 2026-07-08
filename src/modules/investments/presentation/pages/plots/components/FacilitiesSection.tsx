import { useEffect, useState } from 'react';
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
import { InfoRow } from '../../../../../../core/presentation/layouts/ui/card/InfoRow';
import { getCreateFacilityFormSchema } from '../../../schemas/facilityForm.schema';
import { Factory, Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface FacilitiesSectionProps {
  plotId: string;
  dossierId: string;
}

export function FacilitiesSection({ plotId, dossierId }: FacilitiesSectionProps) {
  const { t } = useLanguage();

  const baseUrl = `/investments/facilities`;
  const { entities: facilities, getAll: getFacilities, create: createFacility, update: updateFacility, remove: deleteFacility, loadingMap: facLoading, errorMap: facError } = useEntityCrud<Facility>(baseUrl, baseUrl);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [viewingFacility, setViewingFacility] = useState<Facility | null>(null);
  const [deletingFacility, setDeletingFacility] = useState<Facility | null>(null);

  useEffect(() => {
    if (dossierId) getFacilities();
  }, [dossierId]);

  const handleCreate = async (data: any) => {
    try {
      const res = await createFacility(data);
      toast.success(t('facilities.created', 'investments') || 'Facility created successfully');
      getFacilities();
      setIsCreateOpen(false);
      return res;
    } catch {
      toast.error(t('facilities.create_error', 'investments') || 'Failed to create facility');
      throw {};
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingFacility) return;
    try {
      const res = await updateFacility(editingFacility.id, data);
      toast.success(t('facilities.updated', 'investments') || 'Facility updated successfully');
      getFacilities();
      setEditingFacility(null);
      return res;
    } catch {
      toast.error(t('facilities.update_error', 'investments') || 'Failed to update facility');
      throw {};
    }
  };

  const handleDelete = async () => {
    if (!deletingFacility) return;
    try {
      await deleteFacility(deletingFacility.id);
      toast.success(t('facilities.deleted', 'investments') || 'Facility deleted successfully');
      getFacilities();
    } catch {
      toast.error(t('facilities.delete_error', 'investments') || 'Failed to delete facility');
    }
    setDeletingFacility(null);
  };

  const fields: FieldConfig[] = [
    { name: 'name', type: 'text', label: t('facilities.name', 'investments') || 'Name', required: true },
    { name: 'address', type: 'text', label: t('facilities.address', 'investments') || 'Address', required: true },
    { name: 'city', type: 'text', label: t('facilities.city', 'investments') || 'City', required: true },
    { name: 'phone1', type: 'text', label: t('facilities.phone1', 'investments') || 'Phone', required: true },
    { name: 'phone2', type: 'text', label: t('facilities.phone2', 'investments') || 'Phone 2' },
    { name: 'email', type: 'email', label: t('facilities.email', 'investments') || 'Email' },
    { name: 'capitalSYP', type: 'number', label: t('facilities.capitalSYP', 'investments') || 'Capital (SYP)' },
    { name: 'capitalUSD', type: 'number', label: t('facilities.capitalUSD', 'investments') || 'Capital (USD)' },
    { name: 'machineryValueSYP', type: 'number', label: t('facilities.machineryValueSYP', 'investments') || 'Machinery Value (SYP)' },
    { name: 'machineryValueUSD', type: 'number', label: t('facilities.machineryValueUSD', 'investments') || 'Machinery Value (USD)' },
    { name: 'employeeCount', type: 'number', label: t('facilities.employeeCount', 'investments') || 'Employees' },
    { name: 'dailyProductionCapacity', type: 'number', label: t('facilities.dailyProductionCapacity', 'investments') || 'Daily Capacity' },
    { name: 'monthlyProductionCapacity', type: 'number', label: t('facilities.monthlyProductionCapacity', 'investments') || 'Monthly Capacity' },
    { name: 'annualProductionCapacity', type: 'number', label: t('facilities.annualProductionCapacity', 'investments') || 'Annual Capacity' },
    { name: 'powerCapacity', type: 'text', label: t('facilities.powerCapacity', 'investments') || 'Power Capacity' },
    { name: 'waterConsumption', type: 'text', label: t('facilities.waterConsumption', 'investments') || 'Water Consumption' },
  ];

  const columns = [
    { key: "name", label: t("facilities.name", "investments") || "Name", width: 180 },
    { key: "city", label: t("facilities.city", "investments") || "City", width: 120 },
    { key: "phone1", label: t("facilities.phone1", "investments") || "Phone", width: 130 },
    { key: "email", label: t("facilities.email", "investments") || "Email", width: 180 },
    { key: "employeeCount", label: t("facilities.employeeCount", "investments") || "Employees", width: 100 },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 130,
      render: (row: Facility) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => setViewingFacility(row)} title={t('common.view', 'shared') || 'View'}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditingFacility(row)} title={t('common.edit', 'shared') || 'Edit'}>
            <Pencil size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeletingFacility(row)} title={t('common.delete', 'shared') || 'Delete'}>
            <Trash2 size={16} className="text-danger" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <>
      <SectionCard
        title={t('facilities.title', 'investments') || 'Facilities'}
        icon={<Factory size={20} />}
      >
        <div className="flex items-center justify-between mb-4">
          <div />
          <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={16} />}>
            {t('facilities.add', 'investments') || 'Add Facility'}
          </Button>
        </div>
        {facError["getAll"] ? (
          <ErrorState message={facError["getAll"]} onRetry={getFacilities} />
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
              phone1: editingFacility.phone1,
              phone2: editingFacility.phone2,
              email: editingFacility.email || '',
              capitalSYP: editingFacility.capitalSYP,
              capitalUSD: editingFacility.capitalUSD,
              machineryValueSYP: editingFacility.machineryValueSYP,
              machineryValueUSD: editingFacility.machineryValueUSD,
              employeeCount: editingFacility.employeeCount,
              dailyProductionCapacity: editingFacility.dailyProductionCapacity,
              monthlyProductionCapacity: editingFacility.monthlyProductionCapacity,
              annualProductionCapacity: editingFacility.annualProductionCapacity,
              powerCapacity: editingFacility.powerCapacity,
              waterConsumption: editingFacility.waterConsumption,
            }}
            onSubmit={handleUpdate}
            onSuccess={() => setEditingFacility(null)}
            onCancel={() => setEditingFacility(null)}
            submitLabel={t('common.edit', 'shared') || 'Edit'}
          />
        )}
      </Dialog>

      <Dialog isOpen={!!viewingFacility} onClose={() => setViewingFacility(null)} title={t('facilities.view', 'investments') || 'View Facility'} size="lg">
        {viewingFacility && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoRow label={t('facilities.name', 'investments') || 'Name'} value={viewingFacility.name} />
            <InfoRow label={t('facilities.city', 'investments') || 'City'} value={viewingFacility.city} />
            <InfoRow label={t('facilities.address', 'investments') || 'Address'} value={viewingFacility.address} />
            <InfoRow label={t('facilities.phone1', 'investments') || 'Phone'} value={viewingFacility.phone1} />
            <InfoRow label={t('facilities.phone2', 'investments') || 'Phone 2'} value={viewingFacility.phone2 || '—'} />
            <InfoRow label={t('facilities.email', 'investments') || 'Email'} value={viewingFacility.email || '—'} />
            <InfoRow label={t('facilities.employeeCount', 'investments') || 'Employees'} value={viewingFacility.employeeCount ?? '—'} />
            <InfoRow label={t('facilities.capitalSYP', 'investments') || 'Capital (SYP)'} value={viewingFacility.capitalSYP ?? '—'} />
            <InfoRow label={t('facilities.capitalUSD', 'investments') || 'Capital (USD)'} value={viewingFacility.capitalUSD ?? '—'} />
            <InfoRow label={t('facilities.machineryValueSYP', 'investments') || 'Machinery Value (SYP)'} value={viewingFacility.machineryValueSYP ?? '—'} />
            <InfoRow label={t('facilities.machineryValueUSD', 'investments') || 'Machinery Value (USD)'} value={viewingFacility.machineryValueUSD ?? '—'} />
            <InfoRow label={t('facilities.dailyProductionCapacity', 'investments') || 'Daily Capacity'} value={viewingFacility.dailyProductionCapacity ?? '—'} />
            <InfoRow label={t('facilities.monthlyProductionCapacity', 'investments') || 'Monthly Capacity'} value={viewingFacility.monthlyProductionCapacity ?? '—'} />
            <InfoRow label={t('facilities.annualProductionCapacity', 'investments') || 'Annual Capacity'} value={viewingFacility.annualProductionCapacity ?? '—'} />
            <InfoRow label={t('facilities.powerCapacity', 'investments') || 'Power Capacity'} value={viewingFacility.powerCapacity || '—'} />
            <InfoRow label={t('facilities.waterConsumption', 'investments') || 'Water Consumption'} value={viewingFacility.waterConsumption ?? '—'} />
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        isOpen={!!deletingFacility}
        title={t('facilities.delete_title', 'investments') || 'Delete Facility'}
        message={t('facilities.delete_message', 'investments') || 'Are you sure you want to delete this facility?'}
        onConfirm={handleDelete}
        onCancel={() => setDeletingFacility(null)}
        confirmLoading={facLoading["remove"]}
      />
    </>
  );
}
