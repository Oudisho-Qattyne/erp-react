import { useMemo, useState } from "react"
import { DataMatrixInput, type MatrixFieldConfig } from "./core/presentation/layouts/ui/inputs/DataMatrixInput"
import { toast } from "sonner"
import { SubscriptionRequestPaper } from "./modules/investments/presentation/components/subscriptionRequests/SubscriptionRequest"
import type { SubscriptionRequestV100 } from "./modules/investments/domain/entities/subscriptionRequests/versions/subscriptionRequestV100"

interface PersonRecord {
  id: number
  name: string
  email: string
  phone: string
  role: string
}

const PERSONS: PersonRecord[] = [
  { id: 1, name: "Ahmad Al-Hassan", email: "ahmad.alhassan@gmail.com", phone: "0933111222", role: "General Manager" },
  { id: 2, name: "Omar Nassif", email: "omar.nassif@gmail.com", phone: "0944555666", role: "Accountant" },
  { id: 3, name: "Lina Kattan", email: "lina.kattan@gmail.com", phone: "0955666777", role: "Legal Representative" },
  { id: 4, name: "Rami Youssef", email: "rami.youssef@gmail.com", phone: "0966777888", role: "Manager" },
  { id: 5, name: "Nour Haddad", email: "nour.haddad@gmail.com", phone: "0977888999", role: "General Manager" },
  { id: 6, name: "Sami Wehbe", email: "sami.wehbe@gmail.com", phone: "0988999000", role: "Developer" },
  { id: 7, name: "Hala Saleh", email: "hala.saleh@gmail.com", phone: "0999000111", role: "Manager" },
]

const searchPersonsApi = async (query: string): Promise<Record<string, unknown>[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400))
  const q = query.toLowerCase()
  return PERSONS
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q)
    )
    .map((p) => ({ ...p }))
}

type AuthMode = "single" | "any" | "all"

const MODES: { value: AuthMode; label: string; description: string }[] = [
  {
    value: "single",
    label: "Only one authorized person",
    description: "There can be only one authorized person.",
  },
  {
    value: "any",
    label: "Multiple — any one suffices",
    description: "More than one authorized person; the presence of any single one of them is sufficient.",
  },
  {
    value: "all",
    label: "Multiple — all required",
    description: "More than one authorized person, but the presence of all of them is required.",
  },
]

const emptyRow = (): Record<string, unknown> => ({
  id: null,
  name: "",
  email: "",
  role_in_facility: "",
  __original_name: "",
  __original_email: "",
})

const subscriptionRequestExample: SubscriptionRequestV100 = {
  id: 42,
  plot: {
    id: 8,
    code: "273",
    identifier: "300",
    area: "213.00",
    plot_area_id: 3,
    plot_classification_id: 2,
    latitude: "123",
    longitude: "231",
    notes: null,
    folder_id: "01a03d50-8fca-7007-8f06-b90214a5aa98",
    user_id: 1,
    status: "subscribed",
    created_at: "26-08-2026",
    updated_at: "26-08-2026",
    allocated_dossier_id: null,
  },
  dossier_number: null,
  status: "pending_subscription_fee",
  dossier_date: "27-08-2026",
  allocated_date: null,
  subscription_date: null,
  notes: null,
  created_at: "27-08-2026",
  partners: [
    {
      id: 1,
      first_name: "اوديشو",
      last_name: "قطينه",
      father_name: "والد",
      mother_name: "ولادة",
      grandfather_name: "جد",
      national_id: "123456789",
      nationality: "سوري",
      gender: "male",
      phone: "0956626795",
      facebook: null,
      instagram: null,
      x: null,
      linkedin: null,
      is_possible_investor_in_future: true,
      created_at: "15-08-2026",
      folder_id: "01a00776-ee9e-714e-8fc8-c878f869ddd1",
    },
  ],
  facilities: [
    {
      id: 41,
      plot_id: 8,
      plot_dossier_id: 42,
      name: "مشفى",
      address: "حمص باب سباع",
      company_type: "existing",
      commercial_register: "123",
      commercial_register_date: "2026-08-27",
      company_nationality_id: 215,
      first_phone_number: "0956626795",
      second_phone_number: "0956626795",
      email: "oudiqa2003@gmail.com",
      total_capital_in_usd: 1,
      total_capital_in_syp: 1,
      value_of_machines_in_usd: 1,
      value_of_machines_in_syp: 1,
      number_of_workers: 1,
      electrical_power_capacity: 100,
      yearly_estimated_drinking_water_consumption: 100,
      yearly_estimated_industrial_water_consumption: 100,
      number_or_patrols: 3,
      telephone_lines_number: 10,
      monthly_internet_data_requirement: 100,
      yearly_imported_raw_materials: "ورق",
      export_to_production_ratio: 52,
      created_at: "27-08-2026",
      authorized_persons: [
        {
          person: {
            id: 2,
            name: "غازي",
            email: "ghazy@gmail.com",
            role: null,
            primary_phone_number: "0956626795",
            secondary_phone_number: null,
            whatsapp: null,
            telegram: null,
            x: null,
            linkedin: null,
            facebook: null,
            type: null,
            created_at: "15-08-2026",
          },
          role_in_facility: "مدير",
          is_required_for_legal_matters: true,
        },
      ],
      partnership_type: {
        id: 1,
        name: "إدارية",
        is_active: true,
        is_default: true,
        created_at: "15-08-2026",
      },
      folder_id: "01a04436-366d-70a9-baeb-f8f21d495fea",
      require_all_persons_for_legal_matters: true,
    },
  ],
  transactions: [
    {
      id: "01a04436-3683-73ce-b7b0-b7237a4493d2",
      transaction_type: "incoming",
      transaction_status: "pending",
      transaction_value: 13000,
      client_payed_amount: 13000,
      exchange_rate_id: null,
      exchange_rate: 1,
      transaction_currency_id: "SYP",
      transaction_date: "2026-08-27",
      formatted_transaction_date: "27-08-2026",
      reason: "معاملة طلب اشتراك للإطبارة ذات الرقم #42 في المفسم ذو الرقم #8.",
      created_at: "27-08-2026",
    },
  ],
}


export const Sandbox = () => {
  const [mode, setMode] = useState<AuthMode>("single")
  const [rows, setRows] = useState<Record<string, unknown>[]>([emptyRow()])

  const matrixFields: MatrixFieldConfig[] = [
    { name: "id", label: "ID", type: "numeric", disabled: true, defaultValue: null },
    {
      name: "name",
      label: "Person (name / email / phone)",
      required: true,
      hints: {
        searchApi: searchPersonsApi,
        minChars: 2,
        debounceMs: 300,
        displayValue: (item: Record<string, unknown>) => String(item.name ?? ""),
        fill: (item: Record<string, unknown>) => {
          const result: Record<string, unknown> = {
            id: (item.id as number) ?? null,
            name: String(item.name ?? ""),
            email: String(item.email ?? ""),
            __original_name: String(item.name ?? ""),
            __original_email: String(item.email ?? ""),
          }
          const role = item.role ?? item.role_in_facility
          if (role) result.role_in_facility = String(role)
          return result
        },
      },
    },
    { name: "email", label: "Email", type: "text" },
    { name: "role_in_facility", label: "Role in Facility", type: "text", placeholder: "e.g. General Manager" },
  ]

  const switchMode = (next: AuthMode) => {
    setMode(next)
    if (next === "single") setRows([emptyRow()])
  }

  const payload = useMemo(() => {
    const authorized_persons = rows
      .filter((row) => String(row.name ?? "").trim().length > 0)
      .map((row) => {
        const name = String(row.name ?? "").trim()
        const email = String(row.email ?? "").trim()
        const id = (row.id as number | null) ?? null
        const person: Record<string, unknown> = {}
        if (id != null) {
          person.id = id
          if (name && name !== String(row.__original_name ?? "")) person.name = name
          if (email && email !== String(row.__original_email ?? "")) person.email = email
        } else {
          person.name = name
          if (email) person.email = email
        }
        const entry: Record<string, unknown> = { person }
        const role = String(row.role_in_facility ?? "").trim()
        if (role) entry.role_in_facility = role
        return entry
      })
    return { authorized_persons }
  }, [rows])

  const handleSubmit = () => {
    toast.success("Simulated submit — backend would create/update the persons in CRM")
  }

  return (
    <>
    {/* <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Authorized Persons — Facility Verification</h1>
        <p className="text-sm text-text-muted">
          Simulated demo. The authorized person is the individual through whom all legal matters will be handled. The
          backend creates/updates the persons in CRM — we only build the request.
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold">Authorization options</h2>
        <div className="flex flex-col gap-2">
          {MODES.map((m) => (
            <label
              key={m.value}
              className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                mode === m.value ? "border-primary bg-primary/5" : "border-border hover:bg-primary-light/10"
              }`}
            >
              <input
                type="radio"
                name="auth-mode"
                checked={mode === m.value}
                onChange={() => switchMode(m.value)}
                className="mt-1 accent-primary"
              />
              <span>
                <span className="block text-sm font-semibold text-text">{m.label}</span>
                <span className="block text-xs text-text-muted">{m.description}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-2">Authorized persons</h2>
        <p className="text-sm text-text-muted mb-3">
          Type in the person field to search existing CRM persons (by name, email or phone). Picking a hint fills the
          row with the existing person. Editing the name/email of a picked person becomes an update. Typing a name that
          matches nothing creates a new person in CRM (backend-side).
        </p>
        <DataMatrixInput
          value={rows}
          onChange={setRows}
          matrixFields={matrixFields}
          numberOfRows={mode === "single" ? 1 : undefined}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Request payload</h2>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary-dark transition-colors"
          >
            Simulate submit
          </button>
        </div>
        <pre className="bg-muted/40 border border-border rounded-md p-3 text-xs overflow-x-auto">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>
    </div> */}
    <div className="py-6 space-y-10">
      <div>
        <h2 className="text-xl font-bold text-text mb-4 px-4">Subscription Request — v1.0.0</h2>
        <SubscriptionRequestPaper request={{ version: "1.0.0", payload: subscriptionRequestExample }} />
      </div>
    </div>

    {/* <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">SubscriptionRequestV100 — Example</h1>
        <p className="text-sm text-text-muted">Typed example payload built from the sample JSON.</p>
      </div>
      <pre className="bg-muted/40 border border-border rounded-md p-3 text-xs overflow-x-auto">
        {JSON.stringify(subscriptionRequestExample, null, 2)}
      </pre>
    </div> */}
    </>
    
  )
}
