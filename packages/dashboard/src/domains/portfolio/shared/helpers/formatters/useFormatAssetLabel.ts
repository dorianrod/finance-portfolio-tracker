import { useCallback } from 'react'

import type { RawPosition } from '@/domains/portfolio/shared/types/rawPosition.type'

export function useFormatAssetLabel() {
  return useCallback(
    (
      source: AssetLabelSource | null | undefined,
      { fallback = '' }: { fallback?: string } = {},
    ): string =>
      clean(source?.name) || clean(source?.ticker) || clean(fallback),
    [],
  )
}

export type AssetLabelSource = Partial<Pick<RawPosition, 'name' | 'ticker'>>

function clean(value: string | null | undefined): string {
  return value?.trim() ?? ''
}
