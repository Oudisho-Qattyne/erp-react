import type { DpomainResponsePaginated } from "../../../modules/hr/domain/entities/common/DomainResponsePaginated";
import type { AuditLog } from "../entities/auditLog/auditLog";

export interface IAuditLogsRepository{
    getAuditLogs : (model : string , modelId? : number, page?: number, perPage?: number) => Promise<DpomainResponsePaginated<AuditLog[]>>
}
