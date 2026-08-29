import type { FilterLabelMaps } from "./FilterDialog"

/** Builds an ActiveFilters `formatValue` resolver from captured label maps.
 *  Returns undefined for unknown values so ActiveFilters falls back to the raw value. */
export function createFilterFormatValue(labelMaps: FilterLabelMaps | undefined) {
  return (key: string, value: any): string | undefined => {
    if (!labelMaps) return undefined
    const map = labelMaps[key]
    if (!map) return undefined
    const label = map[String(value)]
    return label !== undefined ? label : undefined
  }
}