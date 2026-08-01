import type { IDossierPartnersRepository } from "../../domain/repositories/IDossierPartnersRepository"

export const createManageDossierPartnersUseCase = (repository: IDossierPartnersRepository) => {
  return {
    getPartners: (plotId: number, dossierId: number) => repository.getDossierPartners(plotId, dossierId),

    addPartners: (plotId: number, dossierId: number, investorIds: number[], idempotencyKey?: string) =>
      repository.addDossierPartners(plotId, dossierId, investorIds, idempotencyKey),

    deletePartners: async (plotId: number, dossierId: number, investorIds: number[], idempotencyKey?: string) =>{
      try {
        const res =  await repository.getDossierPartners(plotId, dossierId)
        if(res.data.partners){
          let newPartners = res.data.partners.map(p => p.id).filter(p => !investorIds.includes(p))
          return repository.addDossierPartners(plotId, dossierId, newPartners, idempotencyKey)
        }
        else throw new Error("Something went wrong.")
      } catch (error) {
        throw error
      }
    },
    listPartnersHistory: (plotId: number, dossierId: number) => repository.getPartnersHistory(plotId, dossierId),
  }
}
