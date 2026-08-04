import type { Fee } from "../../domain/entities/Fee";
import type { FeeStatus } from "../../domain/valueObjects/FeeStatus";

export type CreateFeeDto = Omit<Fee, "id" | "created_at" | "updated_at">;

// Only name and fee_status can be updated; code and fee_value are immutable
export interface UpdateFeeDto {
  name: Fee["name"];
  fee_status: FeeStatus;
}
