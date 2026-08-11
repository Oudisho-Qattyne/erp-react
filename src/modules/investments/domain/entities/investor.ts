export interface Investor {
  id: number;
  first_name: string;
  last_name: string;
  father_name: string;
  mother_name: string;
  grandfather_name: string;
  national_id?: string;
  passport_number?: string;
  nationality: string;
  gender: 'male' | 'female';
  phone?: string;
  whatsapp_number?: string;
  email?: string | null;
  address?: string | null;
  user?: {
    id: number;
    name: string;
  } | null;
  is_possible_investor_in_future: boolean;
  folder?: string;
  interests?: InvestorInterest[];
  facebook?: string;
  instagram?: string;
  x?: string;
  linkedin?: string;
  created_at: string;
  updated_at?: string;
}

export interface InvestorInterest {
  id: number;
  investor_id: number;
  plot_area_ids?: number[];
  plot_classification_ids?: number[];
  min_area?: number;
  max_area?: number;
  notes?: string;
  created_at: string;
}
