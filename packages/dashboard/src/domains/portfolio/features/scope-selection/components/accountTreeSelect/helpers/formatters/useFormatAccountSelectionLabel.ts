import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import type { AccountTreeProps } from '@/domains/portfolio/features/scope-selection/components/accountTreeSelect/accountTreeSelect.types'
import { accountsForType } from '@/domains/portfolio/features/scope-selection/helpers/transformers/accountTreeSelection/accountsForType'
import { accountTypeSelectionState } from '@/domains/portfolio/features/scope-selection/helpers/transformers/accountTreeSelection/accountTypeSelectionState'
import { useFormatAccountLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAccountLabel'
import { getOwnValue } from '@/shared/helpers/transformers/getOwnValue'

export function useFormatAccountSelectionLabel() {
  const formatAccountLabel = useFormatAccountLabel()
  const { t } = useTranslation()
  return useCallback(
    (
      input: Omit<AccountTreeProps, 'onChange'> | null | undefined,
      { fallback = '—' }: { fallback?: string } = {},
    ): string => {
      if (input == null) return fallback
      const {
        accountLabels,
        accountToType,
        allAccountTypes,
        allAccounts,
        selected,
      } = input
      if (selected.size === 0) return t('ui.accounttreeselection.allAccounts')
      const fullTypes = allAccountTypes.filter((type) => {
        const accounts = accountsForType(type, allAccounts, accountToType)
        return accountTypeSelectionState(accounts, selected).allSelected
      })
      const partialAccounts = [...selected].filter((account) => {
        const type = getOwnValue(accountToType, account)
        return !type || !fullTypes.includes(type)
      })
      const parts = [
        ...fullTypes,
        ...partialAccounts.map((account) =>
          formatAccountLabel(account, { labels: accountLabels }),
        ),
      ]
      return parts.length <= 2
        ? parts.join(', ')
        : t('ui.accounttreeselection.moreAccounts', {
            accounts: parts.slice(0, 2).join(', '),
            count: parts.length - 2,
          })
    },
    [formatAccountLabel, t],
  )
}
