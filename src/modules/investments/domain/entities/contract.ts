import type { Dossier } from "./dossier";
import type { PaymentMethod } from "../valueObjects/investments/PaymentMethod";
import type { Installment } from "./installment";

export interface Contract {
  id: number;
  dossier_id?: number | null;
  dossier?: Dossier | null;
  plot_id?: number;
  plot?: { id: number; code?: string; identifier?: string };
  contract_number: string;
  contract_date: string;
  unit_price_per_square_meter: number;
  weighting_factor: number;
  final_price_per_square_meter: number;
  total_price: number;
  payment_method: PaymentMethod;
  installments?:Installment[]
  created_at?: string;
}
