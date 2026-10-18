export interface AssetLabelSource {
  name?: string | null
  ticker?: string | null
}

function clean(value: string | null | undefined): string {
  return value?.trim() ?? ''
}

/** User-facing asset label: descriptive name first, technical identifiers only as fallbacks. */
export function assetDisplayLabel(source: AssetLabelSource, fallback = ''): string {
  return clean(source.name) || clean(source.ticker) || clean(fallback)
}
