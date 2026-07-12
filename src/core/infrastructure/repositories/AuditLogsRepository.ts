import type { DpomainResponsePaginated } from "../../../modules/hr/domain/entities/common/DomainResponsePaginated";
import type { ApiClient } from "../../domain/common/api/ApiClient";
import type { AuditLog } from "../../domain/entities/auditLog/auditLog";
import type { IAuditLogsRepository } from "../../domain/repositories/IAuditLogsRepository";


export function createAuditLogsRepository(apiClieint: ApiClient): IAuditLogsRepository {
    const baseUrl = "/shared-kernal/audit-logs"
    return {
        getAuditLogs: (model: string, modelId?: number, page?: number, perPage?: number) => {
            const params: Record<string, string | boolean | number> = { model };
            if (modelId != null) params.model_id = modelId;
            if (page != null) params.page = page;
            if (perPage != null) params.perPage = perPage;
            return apiClieint.get<DpomainResponsePaginated<AuditLog[]>>(baseUrl, { params });
        }
    }
}