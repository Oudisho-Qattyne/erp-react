import { useLanguage } from "../../../../../core/presentation/context/i18n/I18nProvider"

export function useLeaveTypeLocalization() {
    const { t } = useLanguage()

    const getLeaveLabel = (leave: {
        unit?: string
        balance_mode?: string
        accrual_period?: string
        proration_rules?: { basis?: string; calculation?: string; rounding?: string }
    }, key: string): string => {
        switch (key) {
            case "unit":
                return leave.unit === "day"
                    ? t("leave.unit_day", "hr")
                    : t("leave.unit_hour", "hr")
            case "balance_mode":
                return t("leave.balance_" + leave.balance_mode, "hr")
            case "accrual_period":
                return t("leave.accrual_" + leave.accrual_period, "hr")
            case "proration_basis":
                return t("leave.proration_" + leave.proration_rules?.basis, "hr")
            case "proration_calculation":
                return t("leave.proration_" + leave.proration_rules?.calculation, "hr")
            case "proration_rounding":
                return t("leave.proration_rounding_" + leave.proration_rules?.rounding, "hr")
            default:
                return key
        }
    }

    return { getLeaveLabel }
}
