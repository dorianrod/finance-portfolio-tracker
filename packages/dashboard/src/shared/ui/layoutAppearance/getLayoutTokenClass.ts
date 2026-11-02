export function getLayoutTokenClass<K extends string | number>(
  tokens: Readonly<Record<K, string>>,
  token: K | undefined,
): string | undefined {
  return token === undefined ? undefined : tokens[token]
}
