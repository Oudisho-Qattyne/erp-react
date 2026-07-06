import type { DossierStatus } from "../valueObjects/plots/dossierStatus";

export interface Dossier{
    number : string;
    date:string;
    status:DossierStatus;
}