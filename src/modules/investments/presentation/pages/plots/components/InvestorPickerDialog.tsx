import { useMemo } from "react"
import { useLanguage } from "../../../../../../core/presentation/context/i18n/I18nProvider"
import { SelectFromTable } from "../../../../../../core/presentation/layouts/ui/picker/SelectFromTable"
import type { ColumnDef } from "../../../../../../core/presentation/layouts/ui/tables/ResizableTable"
import type { Investor } from "../../../../domain/entities/investor"
import { useEntityCrud } from "../../../../../../core/presentation/hooks/data/useEntity"
import { toast } from "sonner"
import { handleApiError } from "../../../../../../core/presentation/utils/handleApiError"
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
  const { entities: investors, create, loadingMap, errorMap, pagination, list } = useEntityCrud<Investor>(
    isOpen ? '/investments/investors' : '',
    '/investments/investors',
    { listState: true }
  )

  const handleSort = (column: string) => {
    if (column !== "first_name") return
    list?.setSort(column)
  }

  const handleApplyFilter = (values: Record<string, any>) => {
    const parsed: Record<string, any> = {}
    for (const [key, val] of Object.entries(values)) {
      if (val === "" || val === undefined) continue
      if (val === "true") parsed[key] = true
      else if (val === "false") parsed[key] = false
      else parsed[key] = val
    }
    list?.setFilter(parsed)
  }

  const handleResetFilter = () => {
    const { search, sortColumn, sortOrder } = list?.filter ?? {}
    list?.resetFilter()
    if (search) list?.setSearch(search)
    if (sortColumn) list?.setFilter({ sortColumn, sortOrder })
  }

  const handleApplyDefaultFilter = (parsed: Record<string, any>) => {
    list?.setFilter(parsed as any)
  }

  const filterInitialValues = useMemo(
    () => Object.fromEntries(Object.entries(list?.filter ?? {}).filter(([k]) => !['search', 'sortColumn', 'sortOrder'].includes(k))),
    [list?.filter]
  )

  const columns: ColumnDef<Investor>[] = [
    { key: "id", label: "#", width: 60 },
    { key: "full_name", label: t("investors.full_name", "investments") || "Full Name", width: 180, sortable: true, render: (row: Investor) => [row.first_name, row.father_name, row.last_name].filter(Boolean).join(' ') },
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
    { name: "nationality", label: t("investors.nationality", "investments") || "Nationality", type: "text" as const },
    { name: "gender", label: t("investors.gender", "investments") || "Gender", type: "select" as const, options: [
      { value: "male", label: t("investors.gender_male", "investments") || "Male" },
      { value: "female", label: t("investors.gender_female", "investments") || "Female" },
    ] },
    { name: "email", label: t("investors.email", "investments") || "Email", type: "text" as const },
  ]

  const handleSearch = (query: string) => {
    list?.setSearch(query)
  }

  const createFormFields = [
    { name: 'first_name', type: 'alpha' as const, label: t('investors.first_name', 'investments') || 'First Name', required: true, group: 'personal' },
    { name: 'father_name', type: 'alpha' as const, label: t('investors.father_name', 'investments') || 'Father Name', required: true, group: 'personal' },
    { name: 'grandfather_name', type: 'alpha' as const, label: t('investors.grandfather_name', 'investments') || 'Grandfather Name', group: 'personal' },
    { name: 'last_name', type: 'alpha' as const, label: t('investors.last_name', 'investments') || 'Last Name', required: true, group: 'personal' },
    { name: 'mother_name', type: 'alpha' as const, label: t('investors.mother_name', 'investments') || 'Mother Name', required: true, group: 'personal' },
    { name: 'national_id', type: 'numeric' as const, label: t('investors.national_id', 'investments') || 'National ID', group: 'personal' },
    { name: 'passport_number', type: 'numeric' as const, label: t('investors.passport_number', 'investments') || 'Passport Number', group: 'personal' },
    { name: 'nationality', type: 'alpha' as const, label: t('investors.nationality', 'investments') || 'Nationality', required: true, group: 'personal' },
    {
      name: 'gender',
      type: 'select' as const,
      label: t('investors.gender', 'investments') || 'Gender',
      required: true,
      group: 'personal',
      options: [
        { value: 'male', label: t('investors.gender_male', 'investments') || 'Male' },
        { value: 'female', label: t('investors.gender_female', 'investments') || 'Female' }
      ]
    },
    { name: 'phone', type: 'numeric' as const, label: t('investors.phone', 'investments') || 'Phone', group: 'contact' },
    { name: 'whatsapp_number', type: 'numeric' as const, label: t('investors.whatsapp_number', 'investments') || 'WhatsApp', group: 'contact' },
    { name: 'email', type: 'email' as const, label: t('investors.email', 'investments') || 'Email', group: 'contact' },
    { name: 'address', type: 'textarea' as const, label: t('investors.address', 'investments') || 'Address' },
    { name: 'facebook', type: 'text' as const, label: t('investors.facebook', 'investments') || 'Facebook', group: 'social' },
    { name: 'instagram', type: 'text' as const, label: t('investors.instagram', 'investments') || 'Instagram', group: 'social' },
    { name: 'x', type: 'text' as const, label: t('investors.x', 'investments') || 'X', group: 'social' },
    { name: 'linkedin', type: 'text' as const, label: t('investors.linkedin', 'investments') || 'Linkedin', group: 'social' },
  ]

  const createGroups = [
    {
      group: 'personal',
      title: t('investors.personal_info', 'investments') || 'Personal Info',
      rows: [
        ['first_name', 'father_name'],
        ['grandfather_name', 'last_name'],
        ['mother_name', 'national_id', 'passport_number'],
        ['nationality', 'gender'],
      ],
    },
    { group: 'contact', title: t('investors.contact_info', 'investments') || 'Contact Info', rows: [['phone', 'whatsapp_number', 'email']] },
    { group: 'social', title: t('investors.social_media', 'investments') || 'Social Media', rows: [['facebook', 'instagram', 'x', 'linkedin']] },
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
      onApplyDefaultFilter={handleApplyDefaultFilter}
      data={investors}
      columns={columns}
      isLoading={loadingMap["getAll"]}
      error={errorMap["getAll"]}
      onRetry={() => list?.refresh()}
      onSearch={handleSearch}
      searchPlaceholder={t("dossier.search_placeholder", "investments") || "Search investors..."}
      searchInitialValue={list?.filter.search ?? ""}
      filterFields={filterFields}
      filterValues={filterInitialValues as Record<string, any>}
      onApplyFilter={handleApplyFilter}
      onResetFilter={handleResetFilter}
      sortColumn={(list?.filter.sortColumn as any) ?? ""}
      sortOrder={list?.filter.sortOrder ?? "asc"}
      onSort={handleSort}
      page={list?.page ?? 1}
      perPage={list?.perPage ?? 25}
      totalPages={pagination?.lastPage || 1}
      totalItems={pagination?.total || 0}
      onPageChange={(p: number) => list?.setPage(p)}
      onPerPageChange={(size: number) => list?.setPerPage(size)}
      emptyMessage={t("investors.no_records", "investments") || "No investors found"}
      dialogSize="3xl"
      createConfig={{
        dialogSize:"3xl",
        schema: getCreateInvestorFormSchema(t),
        fields: createFormFields,
        groups: createGroups,
        onSubmit: async (data) => {
          try {
            const res = await create(data)
            toast.success(t('investors.created', 'investments') || 'Investor created successfully')
            list?.refresh()
            return res
          } catch (err: any) {
            handleApiError(err, { module: "investments" })
            throw err
          }
        },
dialogTitle: t('investors.add', 'investments') || 'Add Investor',
        buttonLabel: t('investors.add', 'investments') || 'Add Investor',
        submitLabel: t('investors.add', 'investments') || 'Add Investor',
        createButtonPermission: 'investments.investors.create',
      }}
    />
  )
}
