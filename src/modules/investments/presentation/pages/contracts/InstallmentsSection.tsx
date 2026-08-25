import { useState } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import type { Installment } from '../../../domain/entities/installment';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Dialog } from '../../../../../core/presentation/layouts/ui/dialog/Dialog';
import { SectionCard } from '../../../../../core/presentation/layouts/ui/card/SectionCard';
import { Calendar, CreditCard, Pencil, AlertCircle } from 'lucide-react';
import Input from '../../../../../core/presentation/layouts/ui/inputs/Input';

interface InstallmentsSectionProps {
  contractId: number;
  installments: Installment[];
  payLoading: boolean;
  updateLoading: boolean;
  onPayNextUnpaid: (contractId: number, paymentDate: string) => Promise<void>;
  onUpdatePaymentDate: (installmentId: number, contractId: number, paymentDate: string) => Promise<void>;
}

export function InstallmentsSection({
  contractId,
  installments,
  payLoading,
  updateLoading,
  onPayNextUnpaid,
  onUpdatePaymentDate,
}: InstallmentsSectionProps) {
  const { t } = useLanguage();

  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);

  const [payError, setPayError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editInstallment, setEditInstallment] = useState<Installment | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editError, setEditError] = useState('');

  const openPayDialog = () => {
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayError('');
    setPayDialogOpen(true);
  };

  const handlePay = async () => {
    
    if (!payDate) return;
    const nextUnpaid = sorted.find((i) => !i.payment_date);
    console.log(nextUnpaid , sorted , payDate ,  normalizeDate(nextUnpaid.due_date) , payDate < normalizeDate(nextUnpaid.due_date)) ;
    // if (nextUnpaid && payDate > normalizeDate(nextUnpaid.due_date)) {
    //   setPayError(t('installments.validation.payment_before_due', 'investments') || 'Payment date cannot be before the due date');
    //   return;
    // }
    setPayError('');
    await onPayNextUnpaid(contractId, payDate);
    setPayDialogOpen(false);
  };

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

  const openEditDialog = (inst: Installment) => {
    setEditInstallment(inst);
    setEditDate(normalizeDate(inst.payment_date || ''));
    setEditError('');
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!editInstallment || !editDate) return;
    // if (editDate > normalizeDate(editInstallment.due_date)) {
    //   setEditError(t('installments.validation.payment_before_due', 'investments') || 'Payment date cannot be before the due date');
    //   return;
    // }
    setEditError('');
    await onUpdatePaymentDate(editInstallment.id, contractId, editDate);
    setEditDialogOpen(false);
    setEditInstallment(null);
  };

  const sorted = [...installments].sort((a, b) => a.installment_number - b.installment_number);

  const columns = [
    { key: 'installment_number', label: '#', width: 50 },
    {
      key: 'installment_value',
      label: t('installments.installment_value', 'investments') || 'Installment Value',
      width: 150,
      render: (row: Installment) => Number(row.installment_value).toLocaleString(),
    },
    { key: 'due_date', label: t('installments.due_date', 'investments') || 'Due Date', width: 120 },
    {
      key: 'payment_date',
      label: t('installments.paid', 'investments') || 'Paid',
      width: 100,
      render: (row: Installment) =>
        row.payment_date ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            {t('installments.paid_yes', 'investments') || 'Paid'}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            {t('installments.paid_no', 'investments') || 'Unpaid'}
          </span>
        ),
    },
    {
      key: 'actions',
      label: t('common.actions', 'shared') || 'Actions',
      width: 80,
      render: (row: Installment) =>
        row.payment_date ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditDialog(row)}
            title={t('installments.edit_payment_date', 'investments') || 'Edit Payment Date'}
            requiredPermission="investments.contract-payment-installments.update"
          >
            <Pencil size={16} />
          </Button>
        ) : null,
    },
  ];

  return (
    <SectionCard
      title={t('installments.title', 'investments') || 'Installments'}
      icon={<CreditCard size={20} />}
      empty={installments.length === 0}
      emptyMessage={t('installments.no_installments', 'investments') || 'No installments found'}
    >
      <div className="flex items-center justify-between mb-4">
        <div />
        <Button
          variant="outline"
          size="sm"
          onClick={openPayDialog}
          leftIcon={<Calendar size={16} />}
          disabled={installments.every((i) => i.payment_date)}
          requiredPermission="investments.contract-payment-installments.pay"
        >
          {t('installments.pay_next', 'investments') || 'Pay Next Unpaid'}
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={sorted}
        rowKey="id"
        emptyMessage={t('installments.no_installments', 'investments') || 'No installments found'}
      />

      <Dialog
        isOpen={payDialogOpen}
        onClose={() => setPayDialogOpen(false)}
        title={t('installments.pay_dialog_title', 'investments') || 'Pay Next Unpaid Installment'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePay();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              {t('installments.payment_date', 'investments') || 'Payment Date'} <span className="text-danger">*</span>
            </label>
            <Input type="date" value={payDate} onChange={(val) => { setPayDate(val as string); setPayError('') }} required className="w-full" />
            {payError && <p className="flex items-center gap-1 text-xs text-danger mt-1"><AlertCircle size={12} />{payError}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setPayDialogOpen(false)} disabled={payLoading}>
              {t('common.cancel', 'shared') || 'Cancel'}
            </Button>
            <Button type="submit" disabled={payLoading}>
              {payLoading ? t('common.loading', 'shared') || 'Loading...' : t('installments.confirm_pay', 'investments') || 'Pay'}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditInstallment(null);
        }}
        title={t('installments.edit_payment_date_dialog_title', 'investments') || 'Update Payment Date'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEdit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              {t('installments.payment_date', 'investments') || 'Payment Date'} <span className="text-danger">*</span>
            </label>
            <Input type="date" value={editDate} onChange={(val) => { setEditDate(val as string); setEditError('') }} required className="w-full" />
            {editError && <p className="flex items-center gap-1 text-xs text-danger mt-1"><AlertCircle size={12} />{editError}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditInstallment(null);
              }}
              disabled={updateLoading}
            >
              {t('common.cancel', 'shared') || 'Cancel'}
            </Button>
            <Button type="submit" disabled={updateLoading}>
              {updateLoading ? t('common.loading', 'shared') || 'Loading...' : t('common.save', 'shared') || 'Save'}
            </Button>
          </div>
        </form>
      </Dialog>
    </SectionCard>
  );
}
