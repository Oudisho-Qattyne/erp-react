import type { ServiceCondition } from "./serviceCondition";

export interface PlotServiceCondition extends ServiceCondition {
    pivot: {
        note: string
    }
}