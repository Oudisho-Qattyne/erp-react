import { useState, useEffect } from "react"
import { useLanguage } from "../../../../../../core/presentation/context/i18n/I18nProvider"
import { SelectFromTable } from "../../../../../../core/presentation/layouts/ui/picker/SelectFromTable"
import type { ColumnDef } from "../../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import type { Investor } from "../../../../domain/entities/investor"
import { useEntityCrud } from "../../../../../../core/presentation/hooks/data/useEntity"
import { toast } from "sonner"
import { getCreateInvestorFormSchema } from "../../../schemas/investorForm.schema"

interface InvestorPickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selected: Investor[]) => void
  multiple?: boolean
  initialSelected?: Investor[]
  defaultFilter?: Record<string, any>
}

export function InvestorPickerDialog({
  isOpen,
  onClose,
  onConfirm,
  multiple = false,
  initialSelected = [],
  defaultFilter,
}: InvestorPickerDialogProps) {
  const { t } = useLanguage()
  const { entities: investors, getAll, create, loadingMap, errorMap, pagination } = useEntityCrud<Investor>(
    '/investments/investors',
    '/investments/investors'
  )

  const [sortBy, setSortBy] = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [extraFilters, setExtraFilters] = useState<Record<string, any>>({})
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isOpen) return
    const params = new URLSearchParams()
    if (searchQuery) params.append("search", searchQuery)
    for (const [key, val] of Object.entries(extraFilters)) {
      if (val !== undefined && val !== "") params.append(key, String(val))
    }
    if (sortBy) {
      params.append("sortColumn", sortBy)
      params.append("sortOrder", sortOrder)
    }
    params.append("page", String(page))
    params.append("per_page", String(perPage))
    getAll(`/investments/investors?${params.toString()}`)
  }, [isOpen, searchQuery, sortBy, sortOrder, page, perPage, extraFilters])

  const handleSort = (columnKey: string) => {
    const newOrder = sortBy === columnKey && sortOrder === "asc" ? "desc" : "asc"
    setSortBy(columnKey)
    setSortOrder(newOrder)
    setPage(1)
  }

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {}
    for (const [key, val] of Object.entries(values)) {
      if (val === "" || val === undefined) continue
      if (val === "true") parsed[key] = true
      else if (val === "false") parsed[key] = false
      else parsed[key] = val
    }
    setExtraFilters(parsed)
    setPage(1)
  }

  const handleResetFilter = () => {
    setExtraFilters({})
    setPage(1)
  }

  const columns: ColumnDef<Investor>[] = [
    { key: "id", label: "#", width: 60 },
    { key: "full_name", label: t("investors.full_name", "investments") || "Full Name", width: 180 },
    { key: "national_id", label: t("investors.national_id", "investments") || "National ID", width: 150 },
    { key: "phone", label: t("investors.phone", "investments") || "Phone", width: 140 },
    { key: "nationality", label: t("investors.nationality", "investments") || "Nationality", width: 130 },
  ]

  const filterFields = [
    { name: "has_social_account", label: t("investors.filter_has_social_account", "investments") || "Has Social Account", type: "checkbox" as const },
    { name: "has_facebook_account", label: t("investors.filter_has_facebook_account", "investments") || "Has Facebook", type: "checkbox" as const },
    { name: "has_instagram_account", label: t("investors.filter_has_instagram_account", "investments") || "Has Instagram", type: "checkbox" as const },
    { name: "has_x_account", label: t("investors.filter_has_x_account", "investments") || "Has X (Twitter)", type: "checkbox" as const },
    { name: "has_linkedin_account", label: t("investors.filter_has_linkedin_account", "investments") || "Has LinkedIn", type: "checkbox" as const },
    { name: "is_possible_investor_in_future", label: t("investors.filter_is_possible_investor_in_future", "investments") || "Future Possible Investor", type: "checkbox" as const },
    { name: "has_phone_number", label: t("investors.filter_has_phone_number", "investments") || "Has Phone", type: "checkbox" as const },
    { name: "has_whatsapp_number", label: t("investors.filter_has_whatsapp_number", "investments") || "Has WhatsApp", type: "checkbox" as const },
  ]

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
  }

  const createFormFields = [
    { name: 'full_name', type: 'text' as const, label: t('investors.full_name', 'investments') || 'Full Name', required: true },
    { name: 'national_id', type: 'text' as const, label: t('investors.national_id', 'investments') || 'National ID' },
    { name: 'passport_number', type: 'text' as const, label: t('investors.passport_number', 'investments') || 'Passport Number' },
    { name: 'nationality', type: 'text' as const, label: t('investors.nationality', 'investments') || 'Nationality', required: true },
    {
      name: 'gender',
      type: 'select' as const,
      label: t('investors.gender', 'investments') || 'Gender',
      required: true,
      options: [
        { value: 'male', label: t('investors.gender_male', 'investments') || 'Male' },
        { value: 'female', label: t('investors.gender_female', 'investments') || 'Female' }
      ]
    },
    { name: 'phone', type: 'text' as const, label: t('investors.phone', 'investments') || 'Phone' },
    { name: 'whatsapp_number', type: 'text' as const, label: t('investors.whatsapp_number', 'investments') || 'WhatsApp' },
    { name: 'email', type: 'email' as const, label: t('investors.email', 'investments') || 'Email' },
    { name: 'address', type: 'textarea' as const, label: t('investors.address', 'investments') || 'Address' },
    { name: 'facebook', type: 'text' as const, label: t('investors.facebook', 'investments') || 'Facebook' },
    { name: 'instagram', type: 'text' as const, label: t('investors.instagram', 'investments') || 'Instagram' },
    { name: 'x', type: 'text' as const, label: t('investors.x', 'investments') || 'X (Twitter)' },
    { name: 'linkedin', type: 'text' as const, label: t('investors.linkedin', 'investments') || 'Linkedin' },
  ]

  return (
    <SelectFromTable
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("dossier.picker_title", "investments") || "Select Investors"}
      multiple={multiple}
      initialSelected={initialSelected}
      defaultFilter={defaultFilter}
      onApplyDefaultFilter={(parsed) => setExtraFilters(parsed as any)}
      data={investors}
      columns={columns}
      isLoading={loadingMap["getAll"]}
      error={errorMap["getAll"]}
      onRetry={() => getAll()}
      onSearch={handleSearch}
      searchPlaceholder={t("dossier.search_placeholder", "investments") || "Search investors..."}
      sortColumn={sortBy}
      sortOrder={sortOrder}
      onSort={handleSort}
      filterFields={filterFields}
      filterValues={extraFilters}
      onApplyFilter={handleApplyFilter}
      onResetFilter={handleResetFilter}
      page={page}
      perPage={perPage}
      totalPages={pagination?.lastPage || 1}
      totalItems={pagination?.total || 0}
      onPageChange={setPage}
      onPerPageChange={(size) => { setPerPage(size); setPage(1) }}
      emptyMessage={t("investors.no_records", "investments") || "No investors found"}
      createConfig={{
        schema: getCreateInvestorFormSchema(t),
        fields: createFormFields,
        onSubmit: async (data) => {
          try {
            const res = await create(data)
            toast.success(t('investors.created', 'investments') || 'Investor created successfully')
            getAll(`/investments/investors?page=1&per_page=25`)
            return res
          } catch {
            toast.error(t('investors.create_error', 'investments') || 'Failed to create investor')
            throw {}
          }
        },
        dialogTitle: t('investors.add', 'investments') || 'Add Investor',
        buttonLabel: t('investors.add', 'investments') || 'Add Investor',
        submitLabel: t('investors.add', 'investments') || 'Add Investor',
      }}
    />
  )
}
