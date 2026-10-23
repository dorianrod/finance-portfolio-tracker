import { accountLabel } from '@/domains/portfolio/components/filters/helpers/filters/portfolioFilters'

export function accountsForType(
  type: string,
  allAccounts: string[],
  accountToType: Record<string, string>,
): string[] {
  return allAccounts.filter((account) => accountToType[account] === type)
}

export function accountTypeSelectionState(
  accounts: string[],
  selected: Set<string>,
) {
  const selectedCount = accounts.filter((account) => selected.has(account)).length
  const allSelected = accounts.length > 0 && selectedCount === accounts.length
  return {
    allSelected,
    partiallySelected: selectedCount > 0 && !allSelected,
    selectedCount,
  }
}

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

export function buildAccountSelectionLabel({
  accountLabels,
  accountToType,
  allAccountTypes,
  allAccounts,
  selected,
}: {
  accountLabels: Record<string, string>
  accountToType: Record<string, string>
  allAccountTypes: string[]
  allAccounts: string[]
  selected: Set<string>
}): string {
  if (selected.size === 0) return 'All accounts'
  const fullTypes = allAccountTypes.filter((type) => {
    const accounts = accountsForType(type, allAccounts, accountToType)
    return accountTypeSelectionState(accounts, selected).allSelected
  })
  const partialAccounts = [...selected].filter((account) => {
    const type = accountToType[account]
    return !type || !fullTypes.includes(type)
  })
  const parts = [
    ...fullTypes,
    ...partialAccounts.map((account) => accountLabel(account, accountLabels)),
  ]
  return parts.length <= 2
    ? parts.join(', ')
    : `${parts.slice(0, 2).join(', ')} +${parts.length - 2}`
}
