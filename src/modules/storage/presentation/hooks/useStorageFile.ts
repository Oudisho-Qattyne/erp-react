import { useApiClient } from "../../../../core/presentation/context/api/ApiClinetProvider"
import { createManageStorageRepository } from "../../infrastructure/repositories/ManageStorageRepository"
import { createManageStorageUseCase } from "../../application/usecases/ManageStorageUseCase"

export interface UseStorageFileReturn {
  getFileBlob: (storageItemId: string | number) => Promise<Blob>;
}

export const useStorageFile = (): UseStorageFileReturn => {
  const apiClient = useApiClient()
  const repository = createManageStorageRepository(apiClient)
  const useCase = createManageStorageUseCase(repository)

  return {
    getFileBlob: (storageItemId: string | number) => useCase.getFileBlob(storageItemId),
  }
}
