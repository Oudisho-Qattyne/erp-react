import type { ISubscriptionRepository } from "../../domain/repositories/ISubscriptionRepository";
import type { SubscriptionRequestStatus } from "../../domain/valueObjects/investments/subscriptionRequestStatus";
import type { CreateSubscriptionDTO } from "../dtos/subscriptionDtos";

export const createSubscriptionUseCase = (repository: ISubscriptionRepository) => {
  return {
    getAllSubscriptionRequests: (plotId: number, params?: any, idempotencyKey?: string) =>
      repository.getAllSubscriptionRequests(plotId, params, idempotencyKey),
    listAllSubscriptionRequests: (params?: any, idempotencyKey?: string) =>
      repository.listAllSubscriptionRequests(params, idempotencyKey),
    getSubscriptionRequestById: (subRequestId: number, idempotencyKey?: string) =>
      repository.getSubscriptionRequestById(subRequestId, idempotencyKey),
    changeSubscriptionRequestStatus: (plotId: number, subRequestId: number, status: SubscriptionRequestStatus, idempotencyKey?: string) =>
      repository.changeSubscriptionRequestStatus(plotId, subRequestId, status, idempotencyKey),
    approveSubscriptionRequest: (plotId: number, subRequestId: number, idempotencyKey?: string) =>
      repository.changeSubscriptionRequestStatus(plotId, subRequestId, 'pending_general_manager', idempotencyKey),
    rejectSubscriptionRequest: (plotId: number, subRequestId: number, idempotencyKey?: string) =>
      repository.changeSubscriptionRequestStatus(plotId, subRequestId, 'subscription_canceled_by_department_manager', idempotencyKey),
    cancelSubscriptionRequestByGeneralManager: (plotId: number, subRequestId: number, idempotencyKey?: string) =>
      repository.changeSubscriptionRequestStatus(plotId, subRequestId, 'subscription_canceled_by_general_manager', idempotencyKey),
    completeSubscriptionRequest: (plotId: number, subRequestId: number, idempotencyKey?: string) =>
      repository.completeSubscriptionRequest(plotId, subRequestId, idempotencyKey),
    createSubscription: (plotId: number, data: CreateSubscriptionDTO, idempotencyKey?: string) =>
      repository.createSubscription(plotId, data, idempotencyKey),
  };
};
