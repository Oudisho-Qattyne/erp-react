import { useEffect, useState } from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useEntityCrud } from '../../../../../../core/presentation/hooks/data/useEntity';
import type { FacilityIndustrialLicense } from '../../../../domain/entities/facilityIndustrialLicense';
import type { IndustryCategory } from '../../../../domain/entities/industryCategory';
import type { IndustryType } from '../../../../domain/entities/industryType';
import type { IndustrialDecisionType } from '../../../../domain/entities/industrialDecisionType';
import type { IndustrialLicenseSource } from '../../../../domain/entities/industrialLicenseSource';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { ErrorState } from '../../../../../../core/presentation/layouts/ui/state/ErrorState';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Dialog } from '../../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { ConfirmDialog } from '../../../../../../core/presentation/layouts/ui/dialog/ConfirmDialog';
import { GenericCreateForm, type FieldConfig } from '../../../../../../core/presentation/layouts/ui/forms/GenericCreateForm';
import { SectionCard } from '../../../../../../core/presentation/layouts/ui/card/SectionCard';
import { getCreateFacilityIndustrialLicenseFormSchema } from '../../../schemas/facilityIndustrialLicenseForm.schema';
import { getCreateIndustryCategoryFormSchema } from '../../../schemas/industryCategoryForm.schema';
import { getCreateIndustryTypeFormSchema } from '../../../schemas/industryTypeForm.schema';
import { getCreateIndustrialDecisionTypeFormSchema } from '../../../schemas/industrialDecisionTypeForm.schema';
import { getCreateIndustrialLicenseSourceFormSchema } from '../../../schemas/industrialLicenseSourceForm.schema';
import { FileCheck, Plus, Pencil, Trash2, Eye, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { getLocalizedName } from '../../../../../../core/presentation/utils/helpes';

interface FacilityIndustrialLicensesSectionProps {
  facilityId: string;
}

export function FacilityIndustrialLicensesSection({ facilityId }: FacilityIndustrialLicensesSectionProps) {
  const { t } = useLanguage();

  const baseUrl = `/investments/facility-industrial-licenses`;
  const { entities: licenses, getAll: getLicenses, create: createLicense, update: updateLicense, remove: deleteLicense, loadingMap: licLoading, errorMap: licError } = useEntityCrud<FacilityIndustrialLicense>(baseUrl, baseUrl);

  const { entities: categories, getAll: getCategories, create: createCategory } = useEntityCrud<IndustryCategory>('/investments/industry-categories', '/investments/industry-categories');
  const { entities: industryTypes, getAll: getIndustryTypes, create: createIndustryType } = useEntityCrud<IndustryType>('/investments/industry-types', '/investments/industry-types');
  const { entities: decisionTypes, getAll: getDecisionTypes, create: createDecisionType } = useEntityCrud<IndustrialDecisionType>('/investments/industrial-decision-types', '/investments/industrial-decision-types');
  const { entities: licenseSources, getAll: getLicenseSources, create: createLicenseSource } = useEntityCrud<IndustrialLicenseSource>('/investments/industrial-license-sources', '/investments/industrial-license-sources');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<FacilityIndustrialLicense | null>(null);
  const [viewingLicense, setViewingLicense] = useState<FacilityIndustrialLicense | null>(null);
  const [deletingLicense, setDeletingLicense] = useState<FacilityIndustrialLicense | null>(null);

  const listUrl = `/investments/facility-industrial-licenses?facility_id=${facilityId}`;

  useEffect(() => {
    if (facilityId) getLicenses(listUrl);
  }, [facilityId]);

  useEffect(() => {
    getCategories();
    getIndustryTypes();
    getDecisionTypes();
    getLicenseSources();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      const res = await createLicense({ ...data, facility_id: Number(facilityId) });
      toast.success(t('facility_industrial_licenses.created', 'investments') || 'License created successfully');
      getLicenses(listUrl);
      setIsCreateOpen(false);
      return res;
    } catch {
      toast.error(t('facility_industrial_licenses.create_error', 'investments') || 'Failed to create license');
      throw {};
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingLicense) return;
    try {
      const res = await updateLicense(editingLicense.id, data);
      toast.success(t('facility_industrial_licenses.updated', 'investments') || 'License updated successfully');
      getLicenses(listUrl);
      setEditingLicense(null);
      return res;
    } catch {
      toast.error(t('facility_industrial_licenses.update_error', 'investments') || 'Failed to update license');
      throw {};
    }
  };

  const handleDelete = async () => {
    if (!deletingLicense) return;
    try {
      await deleteLicense(deletingLicense.id);
      toast.success(t('facility_industrial_licenses.deleted', 'investments') || 'License deleted successfully');
      getLicenses(listUrl);
    } catch {
      toast.error(t('facility_industrial_licenses.delete_error', 'investments') || 'Failed to delete license');
    }
    setDeletingLicense(null);
  };

  const fields: FieldConfig[] = [
    {
      name: 'industry_category_id',
      type: 'select-or-create',
      label: t('facility_industrial_licenses.industry_category', 'investments') || 'Industry Category',
      required: true,
      options: categories.map(c => ({ value: c.id, label: getLocalizedName(c.name) })),
      createTitle: t('industry_categories.create', 'investments') || 'Create Industry Category',
      labelPath: 'name',
      createButtonPermission: 'investments.industry-categories.create',
      renderCreateForm: (onSuccessForm, onCancelForm) => (
        <GenericCreateForm
          schema={getCreateIndustryCategoryFormSchema(t)}
          fields={[
            { name: 'name', type: 'text', label: t('common.name', 'shared') || 'Name', required: true },
            { name: 'is_active', type: 'checkbox', label: t('industry_categories.is_active', 'investments') || 'Is Active' },
            { name: 'is_default', type: 'checkbox', label: t('industry_categories.is_default', 'investments') || 'Set as Default' },
          ]}
          onSubmit={createCategory}
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
      options: industryTypes.map(t => ({ value: t.id, label: getLocalizedName(t.name) })),
      createTitle: t('industry_types.create', 'investments') || 'Create Industry Type',
      labelPath: 'name',
      createButtonPermission: 'investments.industry-types.create',
      renderCreateForm: (onSuccessForm, onCancelForm) => (
        <GenericCreateForm
          schema={getCreateIndustryTypeFormSchema(t)}
          fields={[
            { name: 'name', type: 'text', label: t('common.name', 'shared') || 'Name', required: true },
            { name: 'is_active', type: 'checkbox', label: t('industry_types.is_active', 'investments') || 'Is Active' },
            { name: 'is_default', type: 'checkbox', label: t('industry_types.is_default', 'investments') || 'Set as Default' },
          ]}
          onSubmit={createIndustryType}
          onSuccess={onSuccessForm}
          onCancel={onCancelForm}
          submitLabel={t('common.create', 'shared') || 'Create'}
        />
      ),
    },
    { name: 'industrial_decision_number', type: 'text', label: t('facility_industrial_licenses.decision_number', 'investments') || 'Decision Number', required: true },
    { name: 'industrial_decision_date', type: 'date', label: t('facility_industrial_licenses.decision_date', 'investments') || 'Decision Date', required: true },
    {
      name: 'industrial_decision_type_id',
      type: 'select-or-create',
      label: t('facility_industrial_licenses.decision_type', 'investments') || 'Decision Type',
      required: true,
      options: decisionTypes.map(d => ({ value: d.id, label: getLocalizedName(d.name) })),
      createTitle: t('industrial_decision_types.create', 'investments') || 'Create Decision Type',
      labelPath: 'name',
      createButtonPermission: 'investments.industrial-decision-types.create',
      renderCreateForm: (onSuccessForm, onCancelForm) => (
        <GenericCreateForm
          schema={getCreateIndustrialDecisionTypeFormSchema(t)}
          fields={[
            { name: 'name', type: 'text', label: t('common.name', 'shared') || 'Name', required: true },
            { name: 'is_active', type: 'checkbox', label: t('industrial_decision_types.is_active', 'investments') || 'Is Active' },
            { name: 'is_default', type: 'checkbox', label: t('industrial_decision_types.is_default', 'investments') || 'Set as Default' },
          ]}
          onSubmit={createDecisionType}
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
      options: licenseSources.map(s => ({ value: s.id, label: getLocalizedName(s.name) })),
      createTitle: t('industrial_license_sources.create', 'investments') || 'Create License Source',
      labelPath: 'name',
      createButtonPermission: 'investments.industrial-license-sources.create',
      renderCreateForm: (onSuccessForm, onCancelForm) => (
        <GenericCreateForm
          schema={getCreateIndustrialLicenseSourceFormSchema(t)}
          fields={[
            { name: 'name', type: 'text', label: t('common.name', 'shared') || 'Name', required: true },
            { name: 'is_active', type: 'checkbox', label: t('industrial_license_sources.is_active', 'investments') || 'Is Active' },
            { name: 'is_default', type: 'checkbox', label: t('industrial_license_sources.is_default', 'investments') || 'Set as Default' },
          ]}
          onSubmit={createLicenseSource}
          onSuccess={onSuccessForm}
          onCancel={onCancelForm}
          submitLabel={t('common.create', 'shared') || 'Create'}
        />
      ),
    },
  ];

  const columns = [
    { key: "industrial_decision_number", label: t("facility_industrial_licenses.decision_number", "investments") || "Decision #", width: 160 },
    {
      key: "industry_category",
      label: t("facility_industrial_licenses.industry_category", "investments") || "Category",
      width: 140,
      render: (row: FacilityIndustrialLicense) => getLocalizedName(row.industry_category?.name) || '—',
    },
    {
      key: "industry_type",
      label: t("facility_industrial_licenses.industry_type", "investments") || "Type",
      width: 140,
      render: (row: FacilityIndustrialLicense) => getLocalizedName(row.industry_type?.name) || '—',
    },
    { key: "industrial_decision_date", label: t("facility_industrial_licenses.decision_date", "investments") || "Date", width: 120 },
    {
      key: "industrial_decision_type",
      label: t("facility_industrial_licenses.decision_type", "investments") || "Decision Type",
      width: 120,
      render: (row: FacilityIndustrialLicense) => getLocalizedName(row.industrial_decision_type?.name) || '—',
    },
    {
      key: "industrial_license_source",
      label: t("facility_industrial_licenses.license_source", "investments") || "Source",
      width: 120,
      render: (row: FacilityIndustrialLicense) => getLocalizedName(row.industrial_license_source?.name) || '—',
    },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 130,
      render: (row: FacilityIndustrialLicense) => (
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => setViewingLicense(row)} title={t('common.view', 'shared') || 'View'} requiredPermission="investments.facility-industrial-licenses.view">
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() =>{ setEditingLicense(row)}} title={t('common.edit', 'shared') || 'Edit'} requiredPermission="investments.facility-industrial-licenses.update">
            <Pencil size={16} />
          </Button>
          {
            licenses.length != 1 &&
            <Button variant="ghost" size="sm" onClick={() => setDeletingLicense(row)} title={t('common.delete', 'shared') || 'Delete'} requiredPermission="investments.facility-industrial-licenses.delete">
              <Trash2 size={16} className="text-danger" />
            </Button>
          }
        </div>
      ),
    },
  ];

  return (
    <>
      <SectionCard
        title={t('facility_industrial_licenses.title', 'investments') || 'Industrial Licenses'}
        icon={<FileCheck size={20} />}
      >
        <div className="flex items-center justify-between mb-4">
          <div />
          <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(true)} leftIcon={<Plus size={16} />} requiredPermission="investments.facility-industrial-licenses.create">
            {t('facility_industrial_licenses.add', 'investments') || 'Add License'}
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
            emptyMessage={t('facility_industrial_licenses.no_records', 'investments') || 'No licenses found'}
          />
        )}
      </SectionCard>

      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('facility_industrial_licenses.add', 'investments') || 'Add License'}>
        <GenericCreateForm
          schema={getCreateFacilityIndustrialLicenseFormSchema(t)}
          fields={fields}
          onSubmit={handleCreate}
          onSuccess={() => setIsCreateOpen(false)}
          onCancel={() => setIsCreateOpen(false)}
          submitLabel={t('facility_industrial_licenses.add', 'investments') || 'Add License'}
        />
      </Dialog>

      <Dialog isOpen={!!editingLicense} onClose={() => setEditingLicense(null)} title={t('facility_industrial_licenses.edit', 'investments') || 'Edit License'}>
        {editingLicense && (
          <GenericCreateForm
            schema={getCreateFacilityIndustrialLicenseFormSchema(t)}
            fields={fields}
            defaultValues={{
              industry_category_id: editingLicense?.industry_category?.id,
              industry_type_id: editingLicense?.industry_type?.id,
              industrial_decision_number: editingLicense?.industrial_decision_number,
              industrial_decision_date: editingLicense?.industrial_decision_date,
              industrial_decision_type_id: editingLicense?.industrial_decision_type?.id,
              industrial_license_source_id: editingLicense?.industrial_license_source?.id,
            }}
            onSubmit={handleUpdate}
            onSuccess={() => setEditingLicense(null)}
            onCancel={() => setEditingLicense(null)}
            submitLabel={t('common.edit', 'shared') || 'Edit'}
          />
        )}
      </Dialog>

      <Dialog isOpen={!!viewingLicense} onClose={() => setViewingLicense(null)} title={t('facility_industrial_licenses.view', 'investments') || 'View License'} size="lg">
        {viewingLicense && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">{t('facility_industrial_licenses.decision_number', 'investments') || 'Decision Number'}</span>
                <p className="font-medium">{viewingLicense.industrial_decision_number}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t('facility_industrial_licenses.decision_date', 'investments') || 'Decision Date'}</span>
                <p className="font-medium">{viewingLicense.industrial_decision_date}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t('facility_industrial_licenses.industry_category', 'investments') || 'Industry Category'}</span>
                <p className="font-medium">{getLocalizedName(viewingLicense.industry_category?.name) || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t('facility_industrial_licenses.industry_type', 'investments') || 'Industry Type'}</span>
                <p className="font-medium">{getLocalizedName(viewingLicense.industry_type?.name) || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t('facility_industrial_licenses.decision_type', 'investments') || 'Decision Type'}</span>
                <p className="font-medium">{getLocalizedName(viewingLicense.industrial_decision_type?.name) || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t('facility_industrial_licenses.license_source', 'investments') || 'License Source'}</span>
                <p className="font-medium">{getLocalizedName(viewingLicense.industrial_license_source?.name) || '—'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">{t('facility_industrial_licenses.is_active', 'investments') || 'Is Active'}</span>
                <p className="font-medium">{viewingLicense.is_active ? (t('common.yes', 'shared') || 'Yes') : (t('common.no', 'shared') || 'No')}</p>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        isOpen={!!deletingLicense}
        title={t('facility_industrial_licenses.delete_title', 'investments') || 'Delete License'}
        message={t('facility_industrial_licenses.delete_message', 'investments') || 'Are you sure you want to delete this license?'}
        onConfirm={handleDelete}
        onCancel={() => setDeletingLicense(null)}
        confirmLoading={licLoading["remove"]}
        confirmLabel={t('common.delete', 'shared') || 'Delete'}
        cancelLabel={t('common.cancel', 'shared') || 'Cancel'}
      />
    </>
  );
}
