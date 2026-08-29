import type { SubscriptionRequest } from "../../../domain/entities/subscriptionRequests/subscriptionRequest";
import { SubscriptionRequestpaperV100 } from "./versions/SubscriptionRequestpaperV100";

export const SubscriptionRequestPaper = ({ request }: { request: SubscriptionRequest }) => {
   switch (request.version) {
    case "1.0.0":
        return(
            <SubscriptionRequestpaperV100 request={request}/>
        )
    default:
        break;
   }
}
