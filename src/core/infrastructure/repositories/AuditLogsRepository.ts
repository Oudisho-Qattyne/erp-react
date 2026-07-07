import type { ApiClient } from "../../domain/common/api/ApiClient";
import { type DomainResponse } from "../../domain/common/responce/DomainResponse";
import type { AuditLog } from "../../domain/entities/auditLog/auditLog";
import type { IAuditLogsRepository } from "../../domain/repositories/IAuditLogsRepository";


export function createAuditLogsRepository(apiClieint: ApiClient): IAuditLogsRepository {
    const baseUrl = "/shared-kernal/audit-logs"
    return {
        getAuditLogs: (model: string, modelId?: number) => apiClieint.get<DomainResponse<AuditLog[]>>(baseUrl, {
            params: modelId ?
                {
                    model: model,
                    model_id: modelId
                } :
                {
                    model: model
                }
        })
    }
}