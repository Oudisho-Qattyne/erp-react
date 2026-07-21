import type { Dossier } from "./dossier";

export interface RentContract {
    id: number;
    dossier_id: number;
    dossier?: Dossier;
    plot_id?: number;
    renter_name: string;
    renter_phone: string;
    rent_contract_number: string;
    rent_contract_date: string;
    rent_area: number;
    rent_contract_duration: string;
    rent_contract_industry_id?: number;
    rent_contract_industry?: { id: number; name: string };
}