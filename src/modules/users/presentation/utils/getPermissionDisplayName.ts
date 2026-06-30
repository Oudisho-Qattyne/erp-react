import type { Permission } from '../../domain/entities/permissions';

function formatFallback(name: string): string {
  const parts = name.split('.');
  const label = parts.slice(1).join(' ');
  return label
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
}

export function getPermissionDisplayName(
  perm: Permission,
  t: (key: string, moduleName?: string) => string,
  language: string,
): string {
  const obj = perm.display_name as Record<string, string>;
  const value = obj[language] || obj['en'] || perm.name;
  if (value.includes('.')) {
    const segments = value.split('.');
    if (segments[0] === 'permissions' && segments.length >= 3) {
      const resolved = t(value, segments[1]);
      if (resolved !== value) return resolved;
    }
  }
  return value;
}
