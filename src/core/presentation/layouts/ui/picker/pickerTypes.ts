import type { ColumnDef } from "../tables/ResizableTable";
import type { FilterField } from "../filter/FilterDialog";
import type { FieldConfig, GroupConfig } from "../forms/GenericCreateForm";
import type { ZodSchema } from "zod";

/**
 * Config for the `table-picker` input type.
 * Describes which dialog/data table appears to select from.
 * Can be computed dynamically from other form fields via `compute`.
 */
export interface PickerConfig<T = any> {
  dialogTitle?: string;
  dialogSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  multiple?: boolean;
  // Which key of the selected row becomes the field value (default: "id")
  valueProp?: string;
  // Which key of the row is displayed in the field (default: "name")
  labelProp?: string;
  // Table data & rendering
  data: T[];
  columns: ColumnDef<T>[];
  rowKey?: keyof T;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  // Search
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  // Filters
  filterFields?: FilterField[];
  filterValues?: Record<string, any>;
  onApplyFilter?: (values: Record<string, any>) => void;
  onResetFilter?: () => void;
  // Filter applied automatically each time the dialog opens
  initialFilter?: Record<string, any>;
  onApplyInitialFilter?: (filter: Record<string, any>) => void;
  // Sort
  sortColumn?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  // Pagination
  page?: number;
  perPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  emptyMessage?: string;
  requiredPermission?: string | string[];
  // Create-inside-the-dialog form
  createConfig?: {
    schema: ZodSchema<any>;
    fields?: FieldConfig[];
    groups?: GroupConfig[];
    defaultValues?: Record<string, any>;
    onSubmit: (data: any) => Promise<any>;
    onError?: (error: any) => void;
    dialogTitle?: string;
    dialogSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
    buttonLabel?: string;
    submitLabel?: string;
    createButtonPermission?: string | string[];
  };
}
