import { accountTypeSelectionState } from '@/domains/portfolio/features/scope-selection/helpers/transformers/accountTreeSelection/accountTypeSelectionState'

export function toggleAccountTypeSelection(
  accounts: string[],
  selected: Set<string>,
): Set<string> {
  const { allSelected } = accountTypeSelectionState(accounts, selected)
  const next = new Set(selected)
  for (const account of accounts) {
    if (allSelected) next.delete(account)
    else next.add(account)
  }
  return next
}
