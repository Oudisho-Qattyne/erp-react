import { useMemo, useState } from 'react';
import { useLanguage } from '../../../../../core/presentation/context/i18n/I18nProvider';
import { Button } from '../../../../../core/presentation/layouts/ui/buttons/Button';
import Input from '../../../../../core/presentation/layouts/ui/inputs/Input';
import { inputBaseClasses } from '../../../../../core/presentation/layouts/ui/inputs/styles';
import { CustomSelect } from '../../../../../core/presentation/layouts/ui/inputs/CustomSelect';
import { DataTable } from '../../../../../core/presentation/layouts/ui/tables/ResizableTable';
import { Eye, Search, FileText, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { SubscriptionRequest } from '../../../domain/entities/subscriptionRequests/subscriptionRequest';
import { mockSubscriptionRequests } from '../../../domain/entities/subscriptionRequests/mockSubscriptionRequests';

const STATUS_LABELS: Record<string, string> = {
  pending_subscription_fee: 'Pending Fee',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

export function SubscriptionRequestsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const label = (key: string) => t(`subscription_requests.${key}`, 'investments');
  const statusLabel = (status: string) => t(`subscription_request_status.${status}`, 'investments') || STATUS_LABELS[status] || status;

  const [localSearch, setLocalSearch] = useState('');
  const [search, setSearch] = useState('');
  const [versionFilter, setVersionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let rows = mockSubscriptionRequests;
    if (versionFilter) rows = rows.filter(r => r.version === versionFilter);
    if (statusFilter) rows = rows.filter(r => r.payload.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(r => {
        const p = r.payload;
        const matchesCode = p.plot.code?.toLowerCase().includes(q);
        const matchesDossier = 'dossier_number' in p && p.dossier_number && p.dossier_number.toLowerCase().includes(q);
        const matchesId = String(p.id).includes(q);
        return Boolean(matchesCode || matchesDossier || matchesId);
      });
    }
    rows = [...rows].sort((a, b) => {
      const va = a.payload.id;
      const vb = b.payload.id;
      return sortOrder === 'asc' ? va - vb : vb - va;
    });
    return rows;
  }, [versionFilter, statusFilter, search, sortOrder]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * perPage, safePage * perPage).map(row => ({ id: row.payload.id, row })),
    [filtered, safePage, perPage]
  );

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
    }
  }

  const handleApprove = (id: number) => {
    toast.success(`${label('approve_message')} #${id}`);
  }

  const handleReject = (id: number) => {
    toast.error(`${label('reject_message')} #${id}`);
  }

  const statusOptions = Object.entries(STATUS_LABELS).map(([value]) => ({ value, label: statusLabel(value) }));
  const versionOptions = [
    { value: '1.0.0', label: '1.0.0' },
  ];

  const columns = [
    {
      key: 'id',
      label: 'ID',
      width: 90,
      sortable: true,
      render: (row: { id: number; row: SubscriptionRequest }) => <span className="font-medium">{row.id}</span>,
    },
    {
      key: 'version',
      label: label('version'),
      width: 100,
      render: (row: { id: number; row: SubscriptionRequest }) => (
        <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-green-dark text-white">
        v{row.row.version}
      </span>
      ),
    },
    {
      key: 'code',
      label: label('plot_code'),
      width: 120,
      render: (row: { id: number; row: SubscriptionRequest }) => row.row.payload.plot.code,
    },
    {
      key: 'area',
      label: label('area'),
      width: 120,
      render: (row: { id: number; row: SubscriptionRequest }) => `${row.row.payload.plot.area} ㎡`,
    },
    {
      key: 'dossier',
      label: label('dossier_number'),
      width: 160,
      render: (row: { id: number; row: SubscriptionRequest }) =>
        'dossier_number' in row.row.payload && row.row.payload.dossier_number ? row.row.payload.dossier_number : '—',
    },
    {
      key: 'status',
      label: t('subscription_request.status', 'investments') || 'Status',
      width: 160,
      render: (row: { id: number; row: SubscriptionRequest }) => (
        <span className="inline-flex items-center text-xs font-medium text-primary-dark bg-primary-light/20 px-2 py-0.5 rounded-full">
          {statusLabel(row.row.payload.status)}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: t('common.created_at', 'shared') || 'Created At',
      width: 130,
      render: (row: { id: number; row: SubscriptionRequest }) => row.row.payload.created_at || '—',
    },
    {
      key: 'actions',
      label: t('common.actions', 'shared') || 'Actions',
      width: 170,
      render: (row: { id: number; row: SubscriptionRequest }) => (
        <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/investments/subscription-requests/${row.id}` , '_blank')}
            title={label('view')}
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleApprove(row.id)}
            title={label('approve')}
            className="text-success hover:text-success"
          >
            <Check size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReject(row.id)}
            title={label('reject')}
            className="text-danger hover:text-danger"
          >
            <X size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const pagination = {
    page: safePage,
    totalPages,
    totalItems,
    onPageChange: setPage,
    itemsPerPage: perPage,
    onItemsPerPageChange: (s: number) => { setPerPage(s); setPage(1); },
    itemsPerPageOptions: [10, 25, 50],
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-primary" />
          <h1 className="text-2xl font-bold text-text">{label('title')}</h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="text"
          value={localSearch}
          onChange={setLocalSearch}
          placeholder={label('search_placeholder')}
          baseClasses={inputBaseClasses}
          className="w-64"
        />
        <Button variant="primary" onClick={() => { setSearch(localSearch); setPage(1); }} size="sm" leftIcon={<Search size={14} />}>
          {t('common.search', 'shared') || 'Search'}
        </Button>

       
      </div>

      <DataTable
        columns={columns}
        data={paged}
        rowKey="id"
        emptyMessage={label('empty')}
        pagination={pagination}
        sortColumn={sortColumn}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </div>
  );
}
