import { Check, CheckCheck } from "lucide-react"

export function StatusIcon({ readAt }: { readAt: string | null }) {
  if (readAt) return <CheckCheck size={14} className="text-primary" />
  return <CheckCheck size={14} className="text-text-muted" />
}
