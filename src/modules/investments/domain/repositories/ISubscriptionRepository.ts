import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { SubscriptionRequest } from "../entities/subscriptionRequests/subscriptionRequest";

export interface ISubscriptionRepository {
  getAllSubscriptionRequests(plotId:number , params?:any , idempotencyKey?: string) : Promise<DomainResponse<SubscriptionRequest[]>>
  listAllSubscriptionRequests(params?:any , idempotencyKey?: string) : Promise<DomainResponse<SubscriptionRequest[]>>
  getSubscriptionRequestById(subRequestId: number, idempotencyKey?: string) : Promise<DomainResponse<SubscriptionRequest>>
  changeSubscriptionRequestStatus(plotId:number , subRequestId:number , status:string, notes?: string, idempotencyKey?: string) : Promise<DomainResponse<SubscriptionRequest>>
  completeSubscriptionRequest(plotId:number , subRequestId:number, notes?: string, idempotencyKey?: string) : Promise<DomainResponse<SubscriptionRequest>>
  createSubscription(plotId: number, data: any, idempotencyKey?: string): Promise<DomainResponse<unknown>>;
}
