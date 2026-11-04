import { useCallback } from 'react'

export function useFormatAccountList() {
  return useCallback(
    (
      accounts: readonly string[] | null | undefined,
      { fallback = '' }: { fallback?: string } = {},
    ): string => accounts?.join(', ') || fallback,
    [],
  )
}
