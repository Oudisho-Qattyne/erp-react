import type { ServiceStatusCondition } from "./serviceStatusCondition";

export interface PlotServiceStatusCondition extends ServiceStatusCondition {
    note: string;
    service_status: string;
}
