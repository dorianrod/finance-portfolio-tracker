export interface AssetNameSource {
  name?: string | null
  ticker?: string | null
}

function clean(value: string | null | undefined): string {
  return value?.trim() ?? ''
}

/** Resolves the canonical asset name stored in domain view models. */
export function resolveAssetName(source: AssetNameSource, fallback = ''): string {
  return clean(source.name) || clean(source.ticker) || clean(fallback)
}
