import type { SubscriptionRequestStatus } from "../../valueObjects/investments/subscriptionRequestStatus";
import type { SubscriptionRequestV100, SubscriptionTransaction } from "./versions/subscriptionRequestV100";

export interface SubscriptionRequestCreator {
    id?: number;
    name?: string | null;
    email?: string | null;
    mobile?: string | null;
    status?: string | null;
    photo?: string | null;
    employee_id?: number | null;
    signature?: string | null;
    employee_first_name?: string | null;
    employee_last_name?: string | null;
    created_at?: string | null;
}

export interface SubscriptionRequestV100Record {
    id: number,
    plot_id?: number,
    request_type?: "subscription_request",
    status?: SubscriptionRequestStatus,
    version?: "1.0.0";
    payload?: SubscriptionRequestV100;
    transactions?: SubscriptionTransaction[];
    created_by?: string | number | null;
    creator?: SubscriptionRequestCreator;
    created_at?: string | null;
}

export type SubscriptionRequest = SubscriptionRequestV100Record;
