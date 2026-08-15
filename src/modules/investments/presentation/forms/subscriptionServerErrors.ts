export function mapSubscriptionServerValidationErrors(
  validationErrors: Record<string, string | string[]>
): Record<string, string | string[]> {
  const mapped: Record<string, string | string[]> = {};
  for (const [key, msgs] of Object.entries(validationErrors)) {
    mapped[mapSubscriptionErrorKey(key)] = msgs;
  }
  return mapped;
}

function mapSubscriptionErrorKey(key: string): string {
  if (key === 'partners') return 'investors';
  if (key.startsWith('partners.')) {
    const rest = key.slice('partners.'.length);
    const segments = rest.split('.');
    if (segments[1] === 'investor') {
      return `investors.${segments[0]}.${segments.slice(2).join('.')}`;
    }
    return `investors.${rest}`;
  }
  if (key === 'authorized_persons') return 'authorized_persons';
  if (key.startsWith('authorized_persons.')) {
    const rest = key.slice('authorized_persons.'.length);
    const segments = rest.split('.');
    if (segments[1] === 'person') {
      return `authorized_persons.${segments[0]}.${segments.slice(2).join('.')}`;
    }
    return `authorized_persons.${rest}`;
  }
  if (key.startsWith('facility.')) {
    return key.slice('facility.'.length);
  }
  return key;
}
