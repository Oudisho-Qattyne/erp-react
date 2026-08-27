import type { SubscriptionRequestV100 } from "./versions/subscriptionRequestV100";

export interface SubscriptionRequestV100Record {
    version: "1.0.0";
    payload: SubscriptionRequestV100;
}

export type SubscriptionRequest = SubscriptionRequestV100Record;
