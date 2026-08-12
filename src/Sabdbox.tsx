import { useMemo, useState } from "react"
import { DataMatrixInput, type MatrixFieldConfig } from "./core/presentation/layouts/ui/inputs/DataMatrixInput"
import { toast } from "sonner"

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
    console.log("Simulated submit — authorized_persons payload:", JSON.stringify(payload, null, 2))
    toast.success("Simulated submit — backend would create/update the persons in CRM")
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
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
    </div>
  )
}