import { useCallback } from 'react'

export function useFormatAccountLabel() {
  return useCallback(
    (
      account: string | null | undefined,
      {
        labels = {},
        fallback = '—',
      }: { labels?: Record<string, string>; fallback?: string } = {},
    ): string => {
      if (account == null || account === '') return fallback
      if (Object.hasOwn(labels, account) && labels[account])
        return labels[account]
      return account
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase())
    },
    [],
  )
}
