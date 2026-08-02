import { useCallback, useRef } from 'react';

function hashString(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  return h;
}

function hashData(data: unknown): string {
  const fd = data as { append?: unknown; entries?: unknown } | null;
  if (fd && typeof fd.append === 'function' && typeof fd.entries === 'function') {
    let h = 5381;
    for (const [k, v] of (fd as { entries(): Iterable<[string, unknown]> }).entries()) {
      const file = v as { name?: unknown; size?: unknown; type?: unknown } | null;
      if (file && typeof file === 'object' && 'name' in file && 'size' in file && 'type' in file) {
        h = ((h * 33) ^ hashString(`${k}:${file.name}:${file.size}:${file.type}`)) >>> 0;
      } else {
        h = ((h * 33) ^ hashString(`${k}:${String(v)}`)) >>> 0;
      }
    }
    return h.toString(36);
  }
  if (typeof data === 'undefined' || data === null) return hashString('undefined').toString(36);
  if (typeof data === 'string') return hashString(data).toString(36);
  if (typeof data === 'number' || typeof data === 'boolean') return hashString(String(data)).toString(36);
  try {
    return hashString(JSON.stringify(data) ?? '').toString(36);
  } catch {
    return hashString(String(data)).toString(36);
  }
}

function uuid(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string; getRandomValues?: (values: Uint8Array) => Uint8Array } };
  if (g.crypto && typeof g.crypto.randomUUID === 'function') {
    return g.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const bytes = g.crypto?.getRandomValues
      ? g.crypto.getRandomValues(new Uint8Array(1))
      : new Uint8Array([Math.floor(Math.random() * 256)]);
    const r = bytes[0] & 15;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const IDEMPOTENCY_KEYS = [
  'idempotency_missing_key',
  'idempotency_wrog_data',
  'idempotency_request_process',
] as const;

type IdempotencyCode = (typeof IDEMPOTENCY_KEYS)[number] | null;

function getIdempotencyCode(err: unknown): IdempotencyCode {
  if (typeof err !== 'object' || err === null) return null;
  const data = (err as { data?: unknown }).data;
  if (data === null || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  for (const code of IDEMPOTENCY_KEYS) {
    if (code in record) return code;
  }
  return null;
}

function shouldRegenerateAndRetry(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const status = (err as { status?: unknown }).status;
  if (status !== 409) return false;
  const code = getIdempotencyCode(err);
  return code === 'idempotency_missing_key' || code === 'idempotency_wrog_data';
}

function shouldKeepKey(err: unknown): boolean {
  if (err === undefined || err === null) return false;
  const status = typeof err === 'object' ? (err as { status?: unknown }).status : undefined;
  if (status === undefined || status === null) return true;
  return status === 409 && getIdempotencyCode(err) === 'idempotency_request_process';
}

export interface UseIdempotencyReturn {
  getKey: (action: string, data?: unknown) => string;
  onSettled: (err?: unknown, key?: string) => void;
  run: <T>(action: string, data: unknown, fn: (key: string) => Promise<T>) => Promise<T>;
  reset: () => void;
}

export function useIdempotency(): UseIdempotencyReturn {
  const keysRef = useRef<Map<string, string>>(new Map());

  const getKey = useCallback((action: string, data?: unknown): string => {
    const hash = hashString(`${action}|${hashData(data)}`).toString(36);
    const existing = keysRef.current.get(hash);
    if (existing) return existing;
    const key = uuid();
    keysRef.current.set(hash, key);
    return key;
  }, []);

  const onSettled = useCallback((err?: unknown, key?: string) => {
    if (!key || shouldKeepKey(err)) return;
    for (const [h, k] of keysRef.current) {
      if (k === key) {
        keysRef.current.delete(h);
        return;
      }
    }
  }, []);

  const run = useCallback(async <T>(
    action: string,
    data: unknown,
    fn: (key: string) => Promise<T>
  ): Promise<T> => {
    const MAX_RETRIES = 3;
    let key = getKey(action, data);
    let err: unknown;
    for (let attempt = 0; ; attempt++) {
      try {
        const result = await fn(key);
        onSettled(undefined, key);
        return result;
      } catch (e) {
        err = e;
        if (!shouldRegenerateAndRetry(err) || attempt >= MAX_RETRIES) break;
        for (const [h, k] of keysRef.current) {
          if (k === key) {
            keysRef.current.delete(h);
            break;
          }
        }
        key = getKey(action, data);
      }
    }
    onSettled(err, key);
    throw err;
  }, [getKey, onSettled]);

  const reset = useCallback(() => {
    keysRef.current.clear();
  }, []);

  return { getKey, onSettled, run, reset };
}
