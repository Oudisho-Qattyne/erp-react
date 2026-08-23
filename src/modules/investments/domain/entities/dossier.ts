import type { DossierStatus } from "../valueObjects/plots/dossierStatus";
import type { Plot } from "./plot";

export interface Dossier {
    id:number;
    dossier_number: string;
    dossier_date: string;
    allocated_date?: string;
    subscription_date?: string;
    created_at?: string;
    notes?: string;
    status: DossierStatus;
    plot_id?: number;
    plot?: Plot;
    partners?:any[]
}