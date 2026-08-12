export interface AuthorizedPersonPayload {
  person: {
    id?: number;
    name?: string;
    email?: string | null;
    primary_phone_number?: string | null;
    whatsapp?: string | null;
    facebook?: string | null;
  };
  role_in_facility?: string;
  is_required_for_legal_matters?: boolean;
}

export const emptyAuthorizedPersonRow = (): Record<string, unknown> => ({
  id: null,
  name: '',
  email: '',
  primary_phone_number: '',
  whatsapp: '',
  facebook: '',
  role_in_facility: '',
  is_required_for_legal_matters: true,
  __original_name: '',
  __original_email: '',
});

export const authorizedPersonsPayloadToRows = (
  payload?: AuthorizedPersonPayload[] | null
): Record<string, unknown>[] => {
  if (!Array.isArray(payload) || payload.length === 0) return [emptyAuthorizedPersonRow()];
  return payload.map((entry) => ({
    id: entry.person?.id ?? null,
    name: entry.person?.name ?? '',
    email: entry.person?.email ?? '',
    primary_phone_number: entry.person?.primary_phone_number ?? '',
    whatsapp: entry.person?.whatsapp ?? '',
    facebook: entry.person?.facebook ?? '',
    role_in_facility: entry.role_in_facility ?? '',
    is_required_for_legal_matters: entry.is_required_for_legal_matters ?? true,
    __original_name: entry.person?.name ?? '',
    __original_email: entry.person?.email ?? '',
  }));
};

export const authorizedPersonsRowsToPayload = (rows: Record<string, unknown>[]): AuthorizedPersonPayload[] =>
  rows
    .filter((row) => String(row.name ?? '').trim().length > 0)
    .map((row) => {
      const name = String(row.name ?? '').trim();
      const email = String(row.email ?? '').trim();
      const id = (row.id as number | null) ?? null;
      const person: AuthorizedPersonPayload['person'] = {};
      if (id != null) {
        person.id = id;
        if (name && name !== String(row.__original_name ?? '')) person.name = name;
        if (email && email !== String(row.__original_email ?? '')) person.email = email;
      } else {
        person.name = name;
        if (email) person.email = email;
      }
      const phoneFields = [
        'primary_phone_number',
        'whatsapp',
        'facebook',
      ] as const;
      for (const field of phoneFields) {
        const value = String(row[field] ?? '').trim();
        if (value) person[field] = value;
      }
      const entry: AuthorizedPersonPayload = { person };
      const role = String(row.role_in_facility ?? '').trim();
      if (role) entry.role_in_facility = role;
      if (typeof row.is_required_for_legal_matters === 'boolean') {
        entry.is_required_for_legal_matters = row.is_required_for_legal_matters;
      }
      return entry;
    });