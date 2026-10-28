import type { AccountTreeProps } from '@/domains/portfolio/features/scope-selection/components/accountTreeSelect/accountTreeSelect.types'

export function makeAccountSelection(
  overrides: Partial<SelectionInput> = {},
): SelectionInput {
  return {
    accountLabels: {
      first: 'First account',
      second: 'Second account',
      third: 'Third account',
    },
    accountToType: {
      first: 'Brokerage',
      second: 'Brokerage',
      third: 'Savings',
    },
    allAccountTypes: ['Brokerage', 'Savings'],
    allAccounts: ['first', 'second', 'third'],
    selected: new Set<string>(),
    ...overrides,
  }
}

type SelectionInput = Omit<AccountTreeProps, 'onChange'>
