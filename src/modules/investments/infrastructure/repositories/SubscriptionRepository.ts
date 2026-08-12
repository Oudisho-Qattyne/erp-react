import type { ApiClient } from "../../../../core/domain/common/api/ApiClient";
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { CreateSubscriptionDTO, ISubscriptionRepository } from "../../domain/repositories/ISubscriptionRepository";

export const createSubscriptionRepository = (apiClient: ApiClient): ISubscriptionRepository => {
  const baseUrl = "/investments/plots";

  const idempotencyConfig = (idempotencyKey?: string) =>
    idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined;

  return {
    createSubscription: (plotId, data, idempotencyKey) =>
      apiClient.post<DomainResponse<unknown>, CreateSubscriptionDTO>(
        `${baseUrl}/${plotId}/requests/subscription`,
        data,
        idempotencyConfig(idempotencyKey)
      ),
  };
};