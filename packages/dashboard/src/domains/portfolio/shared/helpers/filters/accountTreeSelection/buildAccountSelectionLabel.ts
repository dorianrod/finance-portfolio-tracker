import { accountLabel } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/accountLabel'
import i18n from '@/i18n/i18n'

import { accountsForType } from './accountsForType'
import { accountTypeSelectionState } from './accountTypeSelectionState'

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
  if (selected.size === 0) return i18n.t('ui.accounttreeselection.allAccounts')
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
