export const getLocalizedName = (name: string | { ar?: string; en?: string } | null | undefined): string => {
    if (!name) return '';
    if (typeof name === 'string') return name;
    return name.ar || name.en || '';
  };