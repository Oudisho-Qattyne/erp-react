export interface Installment {
    id: number;
    contract_id: number;
    installment_number: number;
    installment_value: number;
    due_date: string;
    payment_date?: string;
    created_at: string;
}