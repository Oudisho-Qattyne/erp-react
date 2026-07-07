import type { IAuditLogsRepository } from "../../domain/repositories/IAuditLogsRepository";

export const createAuditLogsUseCase = (repository: IAuditLogsRepository) => {
    return {
        getAuditLogs: (model: string, modelId?: number) => repository.getAuditLogs(model, modelId)
    }
}