import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { Dossier } from "../entities/dossier";
import type { Partner } from "../entities/partner";

export interface IDossierPartnersRepository{
    getDossierPartners : (plotId : number , dossierId : number) => Promise<DomainResponse<Dossier>>;
    addDossierPartners : (plotId : number , dossierId : number , investorIds : number[], idempotencyKey?: string) => Promise<DomainResponse<Dossier>>;
    getPartnersHistory : (plotId : number , dossierId : number) => Promise<DomainResponse<Partner[]>>;
}