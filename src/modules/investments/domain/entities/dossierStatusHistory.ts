import type { User } from "../../../users/domain/entities/user/user"
import type { DossierStatus } from "../valueObjects/plots/dossierStatus"

export interface DossierStatusHistory {
    id: number,
    dossier_id: number,
    status: DossierStatus,
    status_date: string,
    notes: string,
    created_at: string,
    updated_at: string,
    deleted_at: string,
    user_id: number,
    user: User
}
