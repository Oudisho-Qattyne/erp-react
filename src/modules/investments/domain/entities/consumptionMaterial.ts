import type { EntityWithNameOnly } from "../../../../core/domain/entities/EntityWithNameOnly";

export interface ConsumptionMaterial extends EntityWithNameOnly {
  unit: string;
  is_active: boolean;
  is_default: boolean;
}