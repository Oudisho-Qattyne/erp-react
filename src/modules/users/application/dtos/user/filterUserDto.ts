export interface FilterUserDto {
    page: number;
    per_page: number;
    linked_to_user?: boolean;
    "sort_by[name]"?: string;
    "sort_by[email]"?: string;
    "sort_by[created_at]"?: string;
  }