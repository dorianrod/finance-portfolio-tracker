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
    <ChoiceRow
      variant="nested"
      className="flex items-center gap-2 py-1.5 pl-8 pr-3"
    >
      <Checkbox
        checked={selected.has(account)}
        onChange={() => onChange(toggle(selected, account))}
      />
      <Text variant="caption" tone="secondary" truncate className="min-w-0">
        {accountLabel(account, accountLabels)}
      </Text>
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
    <div className="py-1">
      <ChoiceRow
        variant="nested"
        className="flex items-center gap-2 px-3 py-1.5"
      >
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
          <Text variant="micro" tone="subtle" numeric className="ml-auto">
            {selectedCount}/{accounts.length}
          </Text>
        )}
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
    </div>
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
    <ChoiceRow className="flex items-center gap-2 py-1 pl-7 pr-3">
      <Checkbox
        checked={selected.has(account)}
        onChange={() => onChange(toggle(selected, account))}
      />
      <Text variant="caption" tone="muted">
        {accountLabel(account, accountLabels)}
      </Text>
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
      <ChoiceRow className="flex items-center gap-2 px-3 py-1.5">
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
    <Surface variant="selectionPanel" className="overflow-hidden">
      <Button
        type="button"
        onClick={() => onChange(new Set())}
        variant="sectionChoice"
        selected={selected.size === 0}
        className="flex w-full items-center justify-between px-3 py-2.5"
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

      <Surface variant="sectionStart" className="py-1.5">
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
      <SelectionFrame
        selected={hasSelection}
        className="inline-flex items-center"
      >
        <Popover.Trigger
          type="button"
          className="flex items-center gap-1.5 py-1 pl-3 pr-1"
        >
          <span>{triggerLabel}</span>
          <Decorative tone="subtle" className="ml-0.5">
            {open ? '▴' : '▾'}
          </Decorative>
        </Popover.Trigger>
        {hasSelection && (
          <Button
            type="button"
            label={i18n.t('ui.accounttreeselect.reset')}
            onClick={() => onChange(new Set())}
            variant="accentLink"
            className="px-2 py-1"
            title={i18n.t('ui.accounttreeselect.reset')}
          >
            <Decorative>×</Decorative>
          </Button>
        )}
      </SelectionFrame>

      <Popover.Content
        label={triggerLabel}
        align="start"
        className="min-w-48 py-1.5 max-h-72"
      >
        {/* Select all row */}
        <Surface variant="strongSectionEnd" className="pb-1 mb-1">
          <ChoiceRow className="flex items-center gap-2 px-3 py-1.5">
            <Checkbox
              checked={
                selected.size === allAccounts.length && allAccounts.length > 0
              }
              indeterminate={
                selected.size > 0 && selected.size < allAccounts.length
              }
              onChange={() => {
                if (selected.size === allAccounts.length) onChange(new Set())
                else onChange(new Set(allAccounts))
              }}
            />
            <Text variant="captionStrong" tone="secondary">
              {i18n.t('ui.accounttreeselect.selectAll')}
            </Text>
          </ChoiceRow>
        </Surface>
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
      </Popover.Content>
    </Popover>
  )
}
