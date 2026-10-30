export function getOwnValue<T>(
  values: Readonly<Record<string, T>> | null | undefined,
  key: string,
): T | undefined {
  if (values == null || !Object.hasOwn(values, key)) return undefined
  return values[key]
}
