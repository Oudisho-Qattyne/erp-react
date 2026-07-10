import type { DomainResponse } from "../common/responce/DomainResponse";
import type { AuditLog } from "../entities/auditLog/auditLog";

export interface IAuditLogsRepository{
    getAuditLogs : (model : string , modelId? : number) => Promise<DomainResponse<AuditLog[]>>
}
