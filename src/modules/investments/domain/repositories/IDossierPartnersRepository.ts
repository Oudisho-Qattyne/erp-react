import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse";
import type { Dossier } from "../entities/dossier";

export interface IDossierPartnersRepository{
    getDossierPartners : (plotId : number , dossierId : number) => Promise<DomainResponse<Dossier>>;
    addDossierPartners : (plotId : number , dossierId : number , investorIds : number[]) => Promise<DomainResponse<Dossier>>;
}