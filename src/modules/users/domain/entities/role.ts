import type { Permissions } from "./permissions"

export interface Role{
    id:  number,
    name: string,
    display_name: string,
    number_of_users: number,
    created_at: string
  }


  export interface DetailedRole extends Role{
    permissions:Permissions
  }

  export interface CreateRoleData {
    name: string;
    display_name: string;
    permissions: number[];
  }

  export interface UpdateRoleData {
    name?: string;
    display_name?: string;
    permissions?: number[];
  }