import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import { type SubscriptionRequest } from "../../domain/entities/subscriptionRequests/subscriptionRequest";
import type { ISubscriptionRepository } from "../../domain/repositories/ISubscriptionRepository";

export const createSubscriptionRepository = (apiClient: ApiClient): ISubscriptionRepository => {
  const baseUrl = "/investments/plots";

  const idempotencyConfig = (idempotencyKey?: string) =>
    idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined;

  return {
    getAllSubscriptionRequests: (plotId: number, params?: any, idempotencyKey?: string) => apiClient.get<DomainResponse<SubscriptionRequest[]>>(
      `/investments/plots/${plotId}/requests/subscription`,
      { params: params },
    ),
    listAllSubscriptionRequests: (params?: any, idempotencyKey?: string) => apiClient.get<DomainResponse<SubscriptionRequest[]>>(
      `/investments/plots/requests/subscription`,
      { params: params },
    ),
    getSubscriptionRequestById: (subRequestId: number, idempotencyKey?: string) => apiClient.get<DomainResponse<SubscriptionRequest>>(
      `/investments/plots/requests/subscription/${subRequestId}`,
      idempotencyConfig(idempotencyKey)
    ),
    changeSubscriptionRequestStatus: (plotId: number, subRequestId: number, status: string, notes?: string, idempotencyKey?: string) => apiClient.put<DomainResponse<SubscriptionRequest>>(
      `/investments/plots/${plotId}/requests/subscription/${subRequestId}/change-status`,
      {
        status: status,
        notes: notes,
      },
      idempotencyConfig(idempotencyKey)
    ),
    completeSubscriptionRequest: (plotId: number, subRequestId: number, notes?: string, idempotencyKey?: string) => apiClient.put<DomainResponse<SubscriptionRequest>>(
      `/investments/plots/${plotId}/requests/subscription/${subRequestId}/complete`,
      {
        notes: notes
      },
      idempotencyConfig(idempotencyKey)

    ),
    createSubscription: (plotId, data, idempotencyKey) =>
      apiClient.post<DomainResponse<unknown>>(
        `${baseUrl}/${plotId}/requests/subscription`,
        data,
        idempotencyConfig(idempotencyKey)
      ),
  };
};