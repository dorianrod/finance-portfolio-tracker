// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; This account-scope protocol keeps the same filtered history for overview comparisons, wealth and performance. See SHARED_OWNERSHIP_AUDIT.md.
import { normalizeAccountSelection } from '@/domains/portfolio/shared/helpers/transformers/normalizeAccountSelection'

export function isDemoPresetActive(
  selectedAccounts: Set<string>,
  demoPresetAccounts?: string[] | null,
): boolean {
  if (!demoPresetAccounts) return false
  const selected = normalizeAccountSelection(selectedAccounts)
  return (
    selected.length === demoPresetAccounts.length &&
    selected.every((account, index) => account === demoPresetAccounts[index])
  )
}
