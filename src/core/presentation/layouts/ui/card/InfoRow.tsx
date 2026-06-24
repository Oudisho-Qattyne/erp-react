import type { ReactNode } from "react"

interface InfoRowProps {
  label: string
  value: ReactNode
}

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-base font-medium text-text">
        {value ?? <span className="text-text-muted/50 italic">—</span>}
      </span>
    </div>
  )
}
