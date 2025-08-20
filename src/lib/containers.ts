export class Dict<K, V> extends Map<K, V> {
  mustGet(key: K): V {
    const value = this.get(key);
    if (value === undefined) {
      throw new Error(`Key "${key}" not found.`);
    }
    return value;
  }

  getKeys(): K[] {
    return Array.from(this.keys());
  }

  getValues(): V[] {
    return Array.from(this.values());
  }
}

export function updateRecordKey<T>(record: Record<string, T>, oldKey: string, newKey: string): Record<string, T> {
  if (!(oldKey in record)) return record;

  const entries = Object.entries(record);
  const entryIndex = entries.findIndex(([key]) => key === oldKey);
  entries[entryIndex][0] = newKey;

  return Object.fromEntries(entries);
}

export function isArrayEmpty<T>(arr: T[]): boolean {
  return !Array.isArray(arr) || arr.length === 0;
}
