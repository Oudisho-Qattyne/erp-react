import type { CreateSubscriptionDTO, ISubscriptionRepository } from "../../domain/repositories/ISubscriptionRepository";

export const createSubscriptionUseCase = (repository: ISubscriptionRepository) => {
  return {
    createSubscription: (plotId: number, data: CreateSubscriptionDTO, idempotencyKey?: string) =>
      repository.createSubscription(plotId, data, idempotencyKey),
  };
};