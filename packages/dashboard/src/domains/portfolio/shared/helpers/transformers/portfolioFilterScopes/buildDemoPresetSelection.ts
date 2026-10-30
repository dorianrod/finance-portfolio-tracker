// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; This account-scope protocol keeps the same filtered history for overview comparisons, wealth and performance. See SHARED_OWNERSHIP_AUDIT.md.
import { rawAccountId } from '@/domains/portfolio/shared/helpers/transformers/accountFilter/rawAccountId'

export function buildDemoPresetSelection(
  allAccounts: string[],
  demoPresetAccounts?: string[] | null,
): Set<string> | null {
  if (!demoPresetAccounts) return null
  const included = new Set(demoPresetAccounts)
  return new Set(
    allAccounts.filter((account) => included.has(rawAccountId(account))),
  )
}
