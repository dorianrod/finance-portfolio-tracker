import { rawAccountId } from './rawAccountId'

export function rawAccountSet(accountIds?: Set<string>): Set<string> | null {
  if (!accountIds || accountIds.size === 0) return null
  return new Set([...accountIds].map(rawAccountId))
}
