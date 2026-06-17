import type { EntityWithNameOnly } from "../../../../../core/domain/entities/EntityWithNameOnly"
import type { AccrualPeriod } from "../../valueObjects/leave/AccrualPeriod";
import type { BalanceMode } from "../../valueObjects/leave/BalanceMode";
import type { Basis } from "../../valueObjects/leave/Basis";
import type { Calculation } from "../../valueObjects/leave/Calculation";
import type { GrantUnit } from "../../valueObjects/leave/GrantUnit";
import type { LeaveUnit } from "../../valueObjects/leave/LeaveUnit";
import type { Rounding } from "../../valueObjects/leave/Rounding";
import type { RuleConditionOperators } from "../../valueObjects/leave/RuleConditionOperators";
import type { RuleGroupOperators } from "../../valueObjects/leave/RuleGroupOperators";

export interface RuleCondition {
    type: "condition",
    field: string;
    operator: RuleConditionOperators;
    value: string;
}

export interface RuleGroup {
    type: "group",
    operator: RuleGroupOperators,
    conditions: (RuleCondition | RuleGroup)[]
}


export interface Grant {
    value: number;
    unit: GrantUnit;
}

export interface Band {
    rule: RuleGroup;
    grant: Grant;
}
export interface BandCase {
    type: "bands";
    bands: Band[];
}

export interface FixedGrantCase {
    type: "fixed";
    grant: Grant
}


export interface ProportionRules {
    basis: Basis;
    calculation: Calculation;
    rounding: Rounding;
}

export interface Leave extends EntityWithNameOnly{
    "description": string;
    "unit": LeaveUnit,
    "is_paid": boolean;
    "requires_attachment": boolean; // Request Requirements (Attachments & Approvals)
    "requires_approval": boolean; // Request Requirements (Attachments & Approvals)
    "allow_half_day": boolean;
    "allow_hourly": boolean;
    "allow_split": boolean;
    "min_request_units": number, // Request Limits (Minimum & Maximum)
    "max_request_units": number,  // Request Limits (Minimum & Maximum)
    "balance_mode": BalanceMode,
    "accrual_period"?: AccrualPeriod,
    "allow_carry_forward": boolean; // Carry-Forward Policy
    "carry_forward_limit"?: number,
    "eligibility_rules": RuleGroup        //Eligibility Criteria Configuration
    "entitlement_rules"?: BandCase | FixedGrantCase,
    "proration_rules": ProportionRules, // Prorated Leave Balance Calculation
    "is_active": boolean; //   Leave Type Activation Status
    archived_at: string;
}