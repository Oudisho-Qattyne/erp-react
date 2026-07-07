export interface AuditLog {
  id: number;
  description: string;
  created_at: string;
  causer?: { name: string };
  subject_id?: number;
  properties?: {
    old?: Record<string, any>;
    attributes?: Record<string, any>;
  };
}