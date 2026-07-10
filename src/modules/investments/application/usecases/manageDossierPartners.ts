import type { IDossierPartnersRepository } from "../../domain/repositories/IDossierPartnersRepository"

export const createManageDossierPartnersUseCase = (repository: IDossierPartnersRepository) => {
  return {
    getPartners: (plotId: number, dossierId: number) => repository.getDossierPartners(plotId, dossierId),

    addPartners: (plotId: number, dossierId: number, investorIds: number[]) =>
      repository.addDossierPartners(plotId, dossierId, investorIds),

    deletePartners: (plotId: number, dossierId: number, investorIds: number[]) =>
      repository.deleteDossierPartners(plotId, dossierId, investorIds),
  }
}
