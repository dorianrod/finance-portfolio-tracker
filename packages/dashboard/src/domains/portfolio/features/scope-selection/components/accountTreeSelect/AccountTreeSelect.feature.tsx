import { useState } from 'react'

import type { AccountTreeProps } from '@/domains/portfolio/features/scope-selection/components/accountTreeSelect/accountTreeSelect.types'
import { useFormatAccountSelectionLabel } from '@/domains/portfolio/features/scope-selection/components/accountTreeSelect/helpers/formatters/useFormatAccountSelectionLabel'
import { accountsForType } from '@/domains/portfolio/features/scope-selection/helpers/transformers/accountTreeSelection/accountsForType'
import { accountTypeSelectionState } from '@/domains/portfolio/features/scope-selection/helpers/transformers/accountTreeSelection/accountTypeSelectionState'
import { toggleAccountTypeSelection } from '@/domains/portfolio/features/scope-selection/helpers/transformers/accountTreeSelection/toggleAccountTypeSelection'
import { toggle } from '@/domains/portfolio/features/scope-selection/helpers/transformers/toggle'
import { useFormatAccountLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAccountLabel'
import i18n from '@/i18n/i18n'
import { Checkbox } from '@/shared/ui/Checkbox.view'
import { Button } from '@/shared/ui/controls/Button.view'
import { Decorative } from '@/shared/ui/controls/Decorative.view'
import { ChoiceRow } from '@/shared/ui/formElements/ChoiceRow.view'
import { SelectionFrame } from '@/shared/ui/formElements/SelectionFrame.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Popover } from '@/shared/ui/Popover.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { AccountSelectionRows } from './AccountSelectionRows.view'

export function AccountTreeSelect({
  allAccountTypes,
  accountToType,
  allAccounts,
  accountLabels,
  selected,
  onChange,
}: AccountTreeProps) {
  const formatSelection = useFormatAccountSelectionLabel()
  const [open, setOpen] = useState(false)

  function typeAccounts(type: string) {
    return accountsForType(type, allAccounts, accountToType)
  }

  const triggerLabel = formatSelection({
    accountLabels,
    accountToType,
    allAccountTypes,
    allAccounts,
    selected,
  })

  const hasSelection = selected.size > 0
  const accountGroups = allAccountTypes.map((type) => ({
    accounts: typeAccounts(type),
    type,
  }))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <SelectionFrame selected={hasSelection}>
        <Inline as="div" align="center">
          <Popover.Trigger type="button">
            <span>{triggerLabel}</span>
            <Layout as="span" flow="inline">
              <Decorative tone="subtle">{open ? '▴' : '▾'}</Decorative>
            </Layout>
          </Popover.Trigger>
          {hasSelection && (
            <Button
              type="button"
              label={i18n.t('ui.accounttreeselect.reset')}
              onClick={() => onChange(new Set())}
              variant="accentLink"
              title={i18n.t('ui.accounttreeselect.reset')}
            >
              <Decorative>×</Decorative>
            </Button>
          )}
        </Inline>
      </SelectionFrame>

      <Popover.Content label={triggerLabel} align="start" variant="menu">
        <Inset inset="compact">
          {/* Select all row */}
          <Layout spaceAfter="compact">
            <Surface variant="strongSectionEnd">
              <ChoiceRow>
                <Inline as="span" align="center" gap="default" inset="compact">
                  <Checkbox
                    checked={
                      selected.size === allAccounts.length &&
                      allAccounts.length > 0
                    }
                    indeterminate={
                      selected.size > 0 && selected.size < allAccounts.length
                    }
                    onChange={() => {
                      if (selected.size === allAccounts.length)
                        onChange(new Set())
                      else onChange(new Set(allAccounts))
                    }}
                  />
                  <Text variant="captionStrong" tone="secondary">
                    {i18n.t('ui.accounttreeselect.selectAll')}
                  </Text>
                </Inline>
              </ChoiceRow>
            </Surface>
          </Layout>
          {accountGroups.map((group) => (
            <SelectAccountType
              key={group.type}
              accountLabels={accountLabels}
              accounts={group.accounts}
              onChange={onChange}
              selected={selected}
              type={group.type}
            />
          ))}
        </Inset>
      </Popover.Content>
    </Popover>
  )
}

function SelectAccountType({
  accountLabels,
  accounts,
  onChange,
  selected,
  type,
}: {
  accountLabels: Record<string, string>
  accounts: string[]
  onChange: (next: Set<string>) => void
  selected: Set<string>
  type: string
}) {
  const formatAccountLabel = useFormatAccountLabel()
  const rows = accounts.map((account) => ({
    account,
    label: formatAccountLabel(account, { labels: accountLabels }),
    checked: selected.has(account),
  }))
  const handleToggle = (account: string) => onChange(toggle(selected, account))
  if (accounts.length === 0) return null
  const { allSelected, partiallySelected } = accountTypeSelectionState(
    accounts,
    selected,
  )
  return (
    <div>
      <ChoiceRow>
        <Inline as="span" align="center" gap="default" inset="compact">
          <Checkbox
            checked={allSelected}
            indeterminate={partiallySelected}
            onChange={() =>
              onChange(toggleAccountTypeSelection(accounts, selected))
            }
          />
          <Text variant="captionStrong" tone="secondary">
            {type}
          </Text>
        </Inline>
      </ChoiceRow>
      <AccountSelectionRows
        rows={rows}
        onToggle={handleToggle}
        variant="select"
      />
    </div>
  )
}
