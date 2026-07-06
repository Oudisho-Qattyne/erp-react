import type { EntityWithNameOnly } from "../../../../core/domain/entities/EntityWithNameOnly";

export interface IndustryCategory extends EntityWithNameOnly{
  is_active: boolean;
}