import { useState } from 'react'

import {
  accountsForType,
  accountTypeSelectionState,
  buildAccountSelectionLabel,
  toggleAccountTypeSelection,
} from '@/domains/portfolio/shared/helpers/filters/accountTreeSelection'
import {
  accountLabel,
  toggle,
} from '@/domains/portfolio/shared/helpers/filters/portfolioFilters'
import i18n from '@/i18n/i18n'
import { Checkbox } from '@/shared/ui/Checkbox.view'
import { Button, Decorative } from '@/shared/ui/Controls.view'
import { ChoiceRow, SelectionFrame } from '@/shared/ui/FormElements.view'
import { Inline, Inset, Layout } from '@/shared/ui/Layout.view'
import { Popover } from '@/shared/ui/Popover.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

type AccountTreeProps = {
  allAccountTypes: string[]
  accountToType: Record<string, string>
  allAccounts: string[]
  accountLabels: Record<string, string>
  selected: Set<string>
  onChange: (next: Set<string>) => void
}

function TreeAccountRow({
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
    <ChoiceRow variant="nested">
      <Inline as="span" align="center" gap="default" inset="default">
        <Checkbox
          checked={selected.has(account)}
          onChange={() => onChange(toggle(selected, account))}
        />
        <Layout as="span" flow="inline">
          <Text variant="caption" tone="secondary" truncate>
            {accountLabel(account, accountLabels)}
          </Text>
        </Layout>
      </Inline>
    </ChoiceRow>
  )
}

function TreeAccountType({
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
  const { allSelected, partiallySelected, selectedCount } =
    accountTypeSelectionState(accounts, selected)
  return (
    <Inset inset="compact">
      <ChoiceRow variant="nested">
        <Inline as="span" align="center" gap="default" inset="compact">
          <Checkbox
            checked={allSelected}
            indeterminate={partiallySelected}
            onChange={() =>
              onChange(toggleAccountTypeSelection(accounts, selected))
            }
          />
          <Text variant="captionSectionLabel" tone="muted">
            {type}
          </Text>
          {selectedCount > 0 && (
            <Layout as="span" flow="inline" placement="trailing">
              <Text variant="micro" tone="subtle" numeric>
                {selectedCount}/{accounts.length}
              </Text>
            </Layout>
          )}
        </Inline>
      </ChoiceRow>
      {accounts.map((account) => (
        <TreeAccountRow
          key={account}
          account={account}
          // eslint-disable-next-line local/no-prop-drilling -- Account rows are direct children of their owning account-type group.
          accountLabels={accountLabels}
          // eslint-disable-next-line local/no-prop-drilling -- Account rows are direct children of their owning account-type group.
          onChange={onChange}
          // eslint-disable-next-line local/no-prop-drilling -- Account rows are direct children of their owning account-type group.
          selected={selected}
        />
      ))}
    </Inset>
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
          // eslint-disable-next-line local/no-prop-drilling -- Account rows are direct children of their owning account-type group.
          accountLabels={accountLabels}
          // eslint-disable-next-line local/no-prop-drilling -- Account rows are direct children of their owning account-type group.
          onChange={onChange}
          // eslint-disable-next-line local/no-prop-drilling -- Account rows are direct children of their owning account-type group.
          selected={selected}
        />
      ))}
    </div>
  )
}

export function AccountTree({
  allAccountTypes,
  accountToType,
  allAccounts,
  accountLabels,
  selected,
  onChange,
}: AccountTreeProps) {
  const accountGroups = allAccountTypes.map((type) => ({
    accounts: accountsForType(type, allAccounts, accountToType),
    type,
  }))
  return (
    <Layout overflow="clip">
      <Surface variant="selectionPanel">
        <Layout as="span" flow="control" width="full">
          <Button
            type="button"
            onClick={() => onChange(new Set())}
            variant="sectionChoice"
            selected={selected.size === 0}
          >
            <Text variant="medium">
              {i18n.t('ui.accounttreeselect.allAccounts')}
            </Text>
            {selected.size === 0 && (
              <Text variant="captionStrong" tone="accent">
                {i18n.t('ui.accounttreeselect.selected')}
              </Text>
            )}
          </Button>
        </Layout>

        <Surface variant="sectionStart">
          {accountGroups.map((group) => (
            <TreeAccountType
              key={group.type}
              accountLabels={accountLabels}
              accounts={group.accounts}
              onChange={onChange}
              selected={selected}
              type={group.type}
            />
          ))}
        </Surface>
      </Surface>
    </Layout>
  )
}

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
