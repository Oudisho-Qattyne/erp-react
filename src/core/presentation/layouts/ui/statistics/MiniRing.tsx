
export function MiniRing({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  const dash = `${pct * 0.88} 88`
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
        <circle cx="18" cy="18" r="14" fill="none" className="stroke-border/30" strokeWidth="4" />
        <circle cx="18" cy="18" r="14" fill="none" className="stroke-primary" strokeWidth="4" strokeDasharray={dash} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">
        {pct}%
      </div>
    </div>
  )
}