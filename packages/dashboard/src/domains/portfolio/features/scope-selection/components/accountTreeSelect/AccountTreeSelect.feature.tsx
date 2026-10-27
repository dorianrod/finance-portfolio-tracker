import { useState } from 'react'

import type { AccountTreeProps } from '@/domains/portfolio/features/scope-selection/components/accountTreeSelect/accountTreeSelect.types'
import { accountsForType } from '@/domains/portfolio/features/scope-selection/helpers/filters/accountTreeSelection/accountsForType'
import { accountTypeSelectionState } from '@/domains/portfolio/features/scope-selection/helpers/filters/accountTreeSelection/accountTypeSelectionState'
import { buildAccountSelectionLabel } from '@/domains/portfolio/features/scope-selection/helpers/filters/accountTreeSelection/buildAccountSelectionLabel'
import { toggleAccountTypeSelection } from '@/domains/portfolio/features/scope-selection/helpers/filters/accountTreeSelection/toggleAccountTypeSelection'
import { toggle } from '@/domains/portfolio/features/scope-selection/helpers/filters/toggle'
import { accountLabel } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/accountLabel'
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

export function AccountTreeSelect({
  allAccountTypes,
  accountToType,
  allAccounts,
  accountLabels,
  selected,
  onChange,
}: AccountTreeProps) {
  const [open, setOpen] = useState(false)

  function typeAccounts(type: string) {
    return accountsForType(type, allAccounts, accountToType)
  }

  const triggerLabel = buildAccountSelectionLabel({
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

function SelectAccountRow({
  account,
  accountLabels,
  onChange,
  selected,
}: {
  account: string
  accountLabels: Record<string, string>
  onChange: (next: Set<string>) => void
  selected: Set<string>
}) {
  return (
    <ChoiceRow>
      <Inline as="span" align="center" gap="default" inset="default">
        <Checkbox
          checked={selected.has(account)}
          onChange={() => onChange(toggle(selected, account))}
        />
        <Text variant="caption" tone="muted">
          {accountLabel(account, accountLabels)}
        </Text>
      </Inline>
    </ChoiceRow>
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
      {accounts.map((account) => (
        <SelectAccountRow
          key={account}
          account={account}
          // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; The controlled account picker accepts caller-defined labels; its local type group composes rows without coupling them to dashboard queries.
          accountLabels={accountLabels}
          // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; The type group consumes selection and onChange for its bulk checkbox; its direct rows share that controlled API rather than forwarding unused state.
          onChange={onChange}
          // eslint-disable-next-line local/no-prop-drilling -- reviewed: 2026-10-27; The type group consumes selection and onChange for its bulk checkbox; its direct rows share that controlled API rather than forwarding unused state.
          selected={selected}
        />
      ))}
    </div>
  )
}
