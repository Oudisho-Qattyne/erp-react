import type { ApiClient } from "../../../../core/domain/common/api/ApiClient"
import type { DomainResponse } from "../../../../core/domain/common/responce/DomainResponse"
import type { Dossier } from "../../domain/entities/dossier"
import type { IDossierPartnersRepository } from "../../domain/repositories/IDossierPartnersRepository"

export const createDossierPartnersRepository = (apiClient: ApiClient): IDossierPartnersRepository => {
    const baseUrl = "/investments/plots"
    return ({
      getDossierPartners : (plotId : number , dossierId : number) => apiClient.get<DomainResponse<Dossier>>(`${baseUrl}/${plotId}/dossiers/${dossierId}/partners`),
      addDossierPartners :(plotId : number , dossierId : number , investorIds : number[] ) => apiClient.post<DomainResponse<Dossier>>(`${baseUrl}/${plotId}/dossiers/${dossierId}/partners` , {investor_ids:investorIds}),
      deleteDossierPartners :(plotId : number , dossierId : number , investorIds : number[] ) => apiClient.delete<DomainResponse<Dossier>>(`${baseUrl}/${plotId}/dossiers/${dossierId}/partners` ,{investor_ids:investorIds}),

    })
}