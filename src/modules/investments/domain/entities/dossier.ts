import type { DossierStatus } from "../valueObjects/plots/dossierStatus";

export interface Dossier {
    id:number;
    dossier_number: string;
    dossier_date: string;
    allocated_date?: string;
    subscription_date?: null,
    notes?: string;
    status: DossierStatus;
    partners?:any[]
}