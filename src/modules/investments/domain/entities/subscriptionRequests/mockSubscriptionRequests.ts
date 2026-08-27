import type { SubscriptionRequest } from "./subscriptionRequest";
import type { SubscriptionRequestV100, SubscriptionRequestStatus } from "./versions/subscriptionRequestV100";

const v100base: SubscriptionRequestV100 = {
  id: 42,
  plot: {
    id: 8,
    code: "273",
    identifier: "300",
    area: "213.00",
    plot_area_id: 3,
    plot_classification_id: 2,
    latitude: "123",
    longitude: "231",
    notes: null,
    folder_id: "01a03d50-8fca-7007-8f06-b90214a5aa98",
    user_id: 1,
    status: "subscribed",
    created_at: "26-08-2026",
    updated_at: "26-08-2026",
    allocated_dossier_id: null,
  },
  dossier_number: null,
  status: "pending_subscription_fee",
  dossier_date: "27-08-2026",
  allocated_date: null,
  subscription_date: null,
  notes: null,
  created_at: "27-08-2026",
  partners: [
    {
      id: 1,
      first_name: "أحمد",
      last_name: "الحسن",
      father_name: "والد",
      mother_name: "ولادة",
      grandfather_name: "جد",
      national_id: "123456789",
      nationality: "سوري",
      gender: "male",
      phone: "0956626795",
      facebook: null,
      instagram: null,
      x: null,
      linkedin: null,
      is_possible_investor_in_future: true,
      created_at: "15-08-2026",
      folder_id: "01a00776-ee9e-714e-8fc8-c878f869ddd1",
    },
  ],
  facilities: [
    {
      id: 41,
      plot_id: 8,
      plot_dossier_id: 42,
      name: "مشفى",
      address: "حمص باب سباع",
      company_type: "existing",
      commercial_register: "123",
      commercial_register_date: "2026-08-27",
      company_nationality_id: 215,
      first_phone_number: "0956626795",
      second_phone_number: "0956626795",
      email: "oudiqa2003@gmail.com",
      total_capital_in_usd: 1,
      total_capital_in_syp: 1,
      value_of_machines_in_usd: 1,
      value_of_machines_in_syp: 1,
      number_of_workers: 1,
      electrical_power_capacity: 100,
      yearly_estimated_drinking_water_consumption: 100,
      yearly_estimated_industrial_water_consumption: 100,
      number_or_patrols: 3,
      telephone_lines_number: 10,
      monthly_internet_data_requirement: 100,
      yearly_imported_raw_materials: "ورق",
      export_to_production_ratio: 52,
      daily_production_capacities: [
        { material: "ورق مقوى", production: "50 طن" },
        { material: "كرتون", production: "30 طن" },
      ],
      monthly_production_capacities: [
        { material: "ورق مقوى", production: "1500 طن" },
        { material: "كرتون", production: "900 طن" },
      ],
      yearly_production_capacities: [
        { material: "ورق مقوى", production: "18000 طن" },
        { material: "كرتون", production: "11000 طن" },
      ],
      daily_consumption: [
        { id: 1, consumable_material: { id: 1, name: "لب الورق", unit: "طن", is_active: true, is_default: true }, consumption: "40 طن" },
        { id: 2, consumable_material: { id: 2, name: "النشا", unit: "طن", is_active: true, is_default: true }, consumption: "1.5 طن" },
      ],
      created_at: "27-08-2026",
      authorized_persons: [
        {
          person: {
            id: 2,
            name: "غازي",
            email: "ghazy@gmail.com",
            role: null,
            primary_phone_number: "0956626795",
            secondary_phone_number: null,
            whatsapp: null,
            telegram: null,
            x: null,
            linkedin: null,
            facebook: null,
            type: null,
            created_at: "15-08-2026",
          },
          role_in_facility: "مدير",
          is_required_for_legal_matters: true,
        },
      ],
      partnership_type: {
        id: 1,
        name: "إدارية",
        is_active: true,
        is_default: true,
        created_at: "15-08-2026",
      },
      folder_id: "01a04436-366d-70a9-baeb-f8f21d495fea",
      require_all_persons_for_legal_matters: true,
    },
  ],
  transactions: [
    {
      id: "01a04436-3683-73ce-b7b0-b7237a4493d2",
      transaction_type: "incoming",
      transaction_status: "pending",
      transaction_value: 13000,
      client_payed_amount: 13000,
      exchange_rate_id: null,
      exchange_rate: 1,
      transaction_currency_id: "SYP",
      transaction_date: "2026-08-27",
      formatted_transaction_date: "27-08-2026",
      reason: "معاملة طلب اشتراك للإطبارة ذات الرقم #42",
      created_at: "27-08-2026",
    },
  ],
};

const clone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

const statuses: SubscriptionRequestStatus[] = ["pending_subscription_fee", "pending_approval", "approved", "rejected", "completed"];
const plotCodes = ["273", "414", "188", "302", "501", "77", "410", "222", "333", "144"];
const areaNames = ["حمص", "حسياء", "تخريج", "دمر", "عدرا", "شيخ نجار", "باب سباع"];

const buildV100 = (n: number, i: number): SubscriptionRequestV100 => {
  const item = clone(v100base);
  item.id = n;
  item.status = statuses[i % statuses.length];
  item.plot = { ...item.plot, id: i + 1, code: plotCodes[i % plotCodes.length], identifier: String(i + 10) };
  item.facilities = item.facilities.map(f => ({ ...f, id: f.id + i, name: `منشأة رقم ${i + 1}` }));
  return item;
};

export const mockSubscriptionRequests: SubscriptionRequest[] = Array.from({ length: 34 }, (_, i) => {
  const id = 1000 + i;
  return { version: "1.0.0" as const, payload: buildV100(id, i) };
});

export const getMockRequestByVersion = (version: string): SubscriptionRequest | undefined =>
  mockSubscriptionRequests.find(r => r.version === version);

export const getMockRequestById = (id: number): SubscriptionRequest | undefined =>
  mockSubscriptionRequests.find(r => r.payload.id === Number(id));

export const areaName = (n: number) => areaNames[n % areaNames.length];
