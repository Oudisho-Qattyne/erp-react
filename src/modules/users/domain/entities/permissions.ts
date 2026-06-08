import type { MultiLanguage } from "../../../../core/domain/entities/EntityWithNameOnly";

export interface Permission {
    id: number,
    name: string,
    display_name: MultiLanguage,
    created_at: string
}


export interface Permissions {
    [moduleName: string]: {
      [permissionListKey: string]: Permission[];
    };
  }