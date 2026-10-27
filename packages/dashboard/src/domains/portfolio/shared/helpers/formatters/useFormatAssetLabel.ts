import { useCallback } from 'react'

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

export type AssetLabelSource = {
  name?: string | null
  ticker?: string | null
}

function clean(value: string | null | undefined): string {
  return value?.trim() ?? ''
}
