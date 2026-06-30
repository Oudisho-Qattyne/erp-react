export function cleanPayload<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {}

  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) continue

    if (val !== null && typeof val === "object" && !(val instanceof Date)) {
      if (Array.isArray(val)) {
        const cleaned = val
          .map((item) => (item !== null && typeof item === "object" && !(item instanceof Date) ? cleanPayload(item) : item))
          .filter((item) => item !== null && item !== undefined && !(typeof item === "object" && !(item instanceof Date) && Object.keys(item).length === 0))
        result[key] = cleaned
      } else {
        const cleaned = cleanPayload(val)
        if (Object.keys(cleaned).length > 0) result[key] = cleaned
      }
    } else {
      result[key] = val
    }
  }

  return result as T
}
