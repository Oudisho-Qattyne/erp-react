import type { SubscriptionInvestorPayload } from '../../application/dtos/subscriptionDtos';

export const INVESTOR_DATA_FIELDS: readonly (keyof SubscriptionInvestorPayload)[] = [
  'first_name',
  'father_name',
  'grandfather_name',
  'last_name',
  'mother_name',
  'national_id',
  'passport_number',
  'nationality',
  'gender',
  'phone',
  'whatsapp_number',
  'email',
  'address',
  'is_possible_investor_in_future',
];

const BOOLEAN_FIELDS = ['is_possible_investor_in_future'] as const;

export const isBooleanField = (field: keyof SubscriptionInvestorPayload | string): boolean =>
  (BOOLEAN_FIELDS as readonly string[]).includes(field);

export const toRowFieldValue = (field: keyof SubscriptionInvestorPayload, value: unknown): string | boolean =>
  isBooleanField(field) ? Boolean(value) : stringify(value);

const emptyInvestorData = (): Record<string, unknown> => {
  const data: Record<string, unknown> = {};
  for (const field of INVESTOR_DATA_FIELDS) {
    data[field] = isBooleanField(field) ? false : '';
  }
  return data;
};

export const emptyInvestorRow = (): Record<string, unknown> => {
  const data = emptyInvestorData();
  const original: Record<string, unknown> = {};
  for (const field of INVESTOR_DATA_FIELDS) {
    original[`__original_${field}`] = data[field];
  }
  return { id: null, ...data, ...original };
};

const originalKey = (field: keyof SubscriptionInvestorPayload) => `__original_${field}`;

const stringify = (value: unknown): string => (value === null || value === undefined ? '' : String(value));

export const investorsPayloadToRows = (
  payload?: SubscriptionInvestorPayload[] | null
): Record<string, unknown>[] => {
  if (!Array.isArray(payload) || payload.length === 0) return [emptyInvestorRow()];
  return payload.map((entry) => {
    const row: Record<string, unknown> = { id: entry.id ?? null };
    for (const field of INVESTOR_DATA_FIELDS) {
      const value = toRowFieldValue(field, entry[field]);
      row[field] = value;
      row[originalKey(field)] = value;
    }
    return row;
  });
};

export const investorsRowsToPayload = (rows: Record<string, unknown>[]): SubscriptionInvestorPayload[] =>
  rows
    .filter((row) => (row.id as number | null) != null || String(row.first_name ?? '').trim().length > 0)
    .map((row) => {
      const id = (row.id as number | null) ?? null;
      const payload: Record<string, unknown> = {};

      if (id != null) {
        payload.id = id;
        for (const field of INVESTOR_DATA_FIELDS) {
          if (isBooleanField(field)) {
            const current = Boolean(row[field]);
            const original = Boolean(row[originalKey(field)]);
            if (current !== original) payload[field] = current;
          } else {
            const current = stringify(row[field]).trim();
            const original = stringify(row[originalKey(field)]).trim();
            if (current !== original) {
              if (current === '') payload[field] = null;
              else payload[field] = current;
            }
          }
        }
      } else {
        for (const field of INVESTOR_DATA_FIELDS) {
          if (isBooleanField(field)) {
            payload[field] = Boolean(row[field]);
          } else {
            const value = stringify(row[field]).trim();
            if (value) payload[field] = value;
          }
        }
      }

      return payload as SubscriptionInvestorPayload;
    });
