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

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ""

  const normalized = dateStr.includes("T")
    ? dateStr.replace(/\.(\d{3})\d+Z/, ".$1Z")
    : dateStr.replace(" ", "T") + "Z"

  const date = new Date(normalized)
  if (isNaN(date.getTime())) return ""

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}
