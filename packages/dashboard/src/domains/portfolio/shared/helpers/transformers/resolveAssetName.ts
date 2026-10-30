import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

/** Resolves the canonical asset name stored in domain view models. */
export function resolveAssetName(
  source: AssetNameSource,
  fallback = '',
): string {
  return clean(source.name) || clean(source.ticker) || clean(fallback)
}

export type AssetNameSource = Partial<Pick<RawPosition, 'name' | 'ticker'>>

function clean(value: string | null | undefined): string {
  return value?.trim() ?? ''
}
