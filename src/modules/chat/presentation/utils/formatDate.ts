export function formatTime(dateStr: string | null | undefined, locale = "ar-SA"): string {
  if (!dateStr) return ""

  // Trim microseconds to 3 digits (JS Date only supports milliseconds)
  const normalized = dateStr.includes("T")
    ? dateStr.replace(/\.(\d{3})\d+Z/, ".$1Z")
    : dateStr.replace(" ", "T") + "Z"

  const date = new Date(normalized)
  if (isNaN(date.getTime())) return ""

  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDate(dateStr: string | null | undefined, locale = "en-US"): string {
  if (!dateStr) return ""

  const normalized = dateStr.includes("T")
    ? dateStr.replace(/\.(\d{3})\d+Z/, ".$1Z")
    : dateStr.replace(" ", "T") + "Z"

  const date = new Date(normalized)
  if (isNaN(date.getTime())) return ""

  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
