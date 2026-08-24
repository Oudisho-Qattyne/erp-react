export interface ExchangeRate {
  id: number;
  from_currency_code: string;
  to_currency_code: string;
  rate: number;
  effective_date: string;
  created_at?: string;
  updated_at?: string;
}
