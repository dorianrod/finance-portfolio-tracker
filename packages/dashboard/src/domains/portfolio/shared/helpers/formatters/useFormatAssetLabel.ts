import { useCallback } from 'react'

export type AssetLabelSource = {
  name?: string | null
  ticker?: string | null
}

function clean(value: string | null | undefined): string {
  return value?.trim() ?? ''
}

export function useFormatAssetLabel() {
  return useCallback(
    (source: AssetLabelSource, fallback = ''): string =>
      clean(source.name) || clean(source.ticker) || clean(fallback),
    [],
  )
}
