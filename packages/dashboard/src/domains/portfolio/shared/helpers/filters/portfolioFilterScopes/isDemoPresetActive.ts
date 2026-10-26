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
