import type { Dossier } from "./dossier"
import type { Investor } from "./investor"

export interface Partner{
    id: number,
    plot_dossier_id: number,
    investor_id: number,
    investor?:Investor ,
    plot_dossier?: Dossier,
    action:string,
    causer_id: number,
    created_at: string
  }