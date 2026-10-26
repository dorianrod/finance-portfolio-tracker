// eslint-disable-next-line local/shared-feature-usage -- This account-scope protocol keeps the same filtered history for overview comparisons, wealth and performance. See SHARED_OWNERSHIP_AUDIT.md.
import { normalizeAccountSelection } from '@/domains/portfolio/shared/helpers/selectors/normalizeAccountSelection'

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
