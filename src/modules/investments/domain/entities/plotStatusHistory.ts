import type { User } from "../../../users/domain/entities/user/user"
import type { UserStatus } from "../../../users/domain/valueObjects/userStatus"
import type { PlotStatus } from "../valueObjects/plots/plotStatus"

export interface PlotStatusHistory {
    id: number,
    plot_id: number,
    status: PlotStatus,
    status_date: string,
    notes: string,
    created_at: string,
    updated_at: string,
    deleted_at: string,
    user_id: 1,
    user: User
}