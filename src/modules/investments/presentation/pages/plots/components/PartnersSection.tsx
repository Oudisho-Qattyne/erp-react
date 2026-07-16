import { useState, useEffect } from 'react';
import { useLanguage } from '../../../../../../core/presentation/context/i18n/I18nProvider';
import { useAuth } from '../../../../../../core/infrastructure/auth/AuthProvider';
import { useDossierPartners } from '../../../hooks/useDossierPartners';
import type { Investor } from '../../../../domain/entities/investor';
import { Button } from '../../../../../../core/presentation/layouts/ui/buttons/Button';
import { DataTable } from '../../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { InvestorPickerDialog } from './InvestorPickerDialog';
import { SectionCard } from '../../../../../../core/presentation/layouts/ui/card/SectionCard';
import { AuditLog } from '../../../../../../core/presentation/layouts/ui/auditLogs/AuditLog';
import { Users, Plus, Trash2, History } from 'lucide-react';

interface PartnersSectionProps {
  plotId: string;
  dossierId: string;
}

export function PartnersSection({ plotId, dossierId }: PartnersSectionProps) {
  const { t } = useLanguage();
  const { hasPermission } = useAuth();
  const partnersHook = useDossierPartners();

  const [isInvestorPickerOpen, setIsInvestorPickerOpen] = useState(false);
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<(string | number)[]>([]);
  const [auditItem, setAuditItem] = useState<Investor | null>(null);

  useEffect(() => {
    if (dossierId) partnersHook.getPartners(Number(plotId), Number(dossierId));
  }, [dossierId]);

  const handlePartnerPicked = async (investors: Investor[]) => {
    const ids = investors.map((p) => p.id)
    await partnersHook.addPartners(Number(plotId), Number(dossierId), ids)
    setIsInvestorPickerOpen(false)
  }

  const handleRemoveSelected = () => {
    if (selectedPartnerIds.length > 0) {
      partnersHook.deletePartners(Number(plotId), Number(dossierId), selectedPartnerIds.map(Number))
      setSelectedPartnerIds([])
    }
  }

  const partnerColumns = [
    { key: "id", label: "#", width: 60 },
    { key: "full_name", label: t("investors.full_name", "investments") || "Full Name", width: 200, render: (row: Investor) => [row.first_name, row.father_name, row.last_name].filter(Boolean).join(' ') },
    { key: "national_id", label: t("investors.national_id", "investments") || "National ID", width: 150 },
    { key: "phone", label: t("investors.phone", "investments") || "Phone", width: 140 },
    { key: "nationality", label: t("investors.nationality", "investments") || "Nationality", width: 130 },
    {
      key: "actions",
      label: t("common.actions", "shared") || "Actions",
      width: 80,
      render: (row: Investor) => (
        <div className="flex items-center justify-center" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => setAuditItem(row)}
            title={t('investors.edit_log', 'investments') || 'Edit Log'} requiredPermission="shared.audit-logs.view">
            <History size={16} />
          </Button>
        </div>
      ),
    },
  ]

  if (!hasPermission("investments.plot-dossier.list-partners")) return null;

  const handleTranslateValues = (field: string, value: string) => {
    if (field === 'is_active' || field === 'is_possible_investor_in_future') {
      return value === "true" ? (t('common.yes', 'shared') || 'Yes') : value === 'false' ? (t('common.no', 'shared') || 'No') : value;
    }
    if (field === 'gender') {
      const genderKey = `investors.gender_${value}`;
      const translated = t(genderKey, 'investments');
      if (translated && translated !== genderKey) return translated;
    }
    return value;
  };

  return (
    <>
      <SectionCard
        title={t('dossier.partners', 'investments') || 'Partners'}
        icon={<Users size={20} />}
      >
        <div className="flex items-center justify-between mb-4">
          <div />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsInvestorPickerOpen(true)} leftIcon={<Plus size={16} />} requiredPermission="investments.plot-dossier.update-partners">
              {t('dossier.add_investors', 'investments') || 'Add Investors'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRemoveSelected} disabled={selectedPartnerIds.length === 0} leftIcon={<Trash2 size={16} />} requiredPermission="investments.plot-dossier.update-partners">
              {t('dossier.remove_selected', 'investments') || 'Remove Selected'}
            </Button>
          </div>
        </div>
        <DataTable
          columns={partnerColumns}
          data={partnersHook.partners}
          loading={partnersHook.loading['getPartners']}
          rowKey="id"
          selectable
          selectedRows={selectedPartnerIds}
          onSelectionChange={setSelectedPartnerIds}
          emptyMessage={t('dossier.no_partners', 'investments') || 'No partners added'}
        />
      </SectionCard>

      <AuditLog
        isOpen={!!auditItem}
        onClose={() => setAuditItem(null)}
        model="investor"
        modelId={auditItem?.id}
        module="investments"
        labels={{
          title: t('investors.edit_log', 'investments') || 'Edit Log',
          event: t('investors.event', 'investments') || 'Event',
          created_at: t('investors.created_at', 'investments') || 'Created At',
          changed_by: t('investors.changed_by', 'investments') || 'Changed By',
          changes: t('investors.changes', 'investments') || 'Changes',
          field: t('investors.field', 'investments') || 'Field',
          old_value: t('investors.old_value', 'investments') || 'Old Value',
          new_value: t('investors.new_value', 'investments') || 'New Value',
          no_records: t('investors.no_edit_log', 'investments') || 'No edit logs found',
          subject_id: t('investors.subject_id', 'investments') || 'Investor ID',
        }}
        translateField={(key) => t(`investors.${key}`, 'investments') || key}
        translateValues={handleTranslateValues}
      />

      <InvestorPickerDialog
        isOpen={isInvestorPickerOpen}
        onClose={() => setIsInvestorPickerOpen(false)}
        onConfirm={handlePartnerPicked}
        multiple
        initialSelected={partnersHook.partners}
      />
    </>
  );
}
