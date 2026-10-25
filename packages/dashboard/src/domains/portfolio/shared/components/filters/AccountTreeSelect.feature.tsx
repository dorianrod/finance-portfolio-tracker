import { useRef, useState } from 'react'

import {
  accountsForType,
  accountTypeSelectionState,
  buildAccountSelectionLabel,
  toggleAccountTypeSelection,
} from '@/domains/portfolio/shared/helpers/filters/accountTreeSelection'
import i18n from '@/i18n/i18n'

import { accountLabel, toggle } from './helpers/filters/portfolioFilters'
import { IndeterminateCheckbox } from './IndeterminateCheckbox.view'
import { useCloseAccountTreeOnOutsideClick } from './services/useCloseAccountTreeOnOutsideClick'

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
    <label className="flex cursor-pointer items-center gap-2 py-1.5 pl-8 pr-3 hover:bg-surface-raised/80">
      <input
        type="checkbox"
        checked={selected.has(account)}
        onChange={() => onChange(toggle(selected, account))}
        className="h-3.5 w-3.5 cursor-pointer accent-accent"
      />
      <span className="min-w-0 truncate text-xs text-content-secondary">
        {accountLabel(account, accountLabels)}
      </span>
    </label>
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
      <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-surface-raised/80">
        <IndeterminateCheckbox
          checked={allSelected}
          indeterminate={partiallySelected}
          onChange={() =>
            onChange(toggleAccountTypeSelection(accounts, selected))
          }
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-content-muted">
          {type}
        </span>
        {selectedCount > 0 && (
          <span className="ml-auto text-[11px] tabular-nums text-content-subtle">
            {selectedCount}/{accounts.length}
          </span>
        )}
      </label>
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
    <label className="flex cursor-pointer items-center gap-2 py-1 pl-7 pr-3 hover:bg-surface-hover">
      <input
        type="checkbox"
        checked={selected.has(account)}
        onChange={() => onChange(toggle(selected, account))}
        className="h-3.5 w-3.5 cursor-pointer accent-accent"
      />
      <span className="text-xs text-content-muted">
        {accountLabel(account, accountLabels)}
      </span>
    </label>
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
      <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-surface-hover">
        <IndeterminateCheckbox
          checked={allSelected}
          indeterminate={partiallySelected}
          onChange={() =>
            onChange(toggleAccountTypeSelection(accounts, selected))
          }
        />
        <span className="text-xs font-semibold text-content-secondary">
          {type}
        </span>
      </label>
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
    <div className="overflow-hidden rounded-xl border border-border-strong bg-canvas/35">
      <button
        type="button"
        onClick={() => onChange(new Set())}
        className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors ${selected.size === 0 ? 'bg-accent-muted/35 text-accent' : 'text-content-secondary hover:bg-surface-raised'}`}
      >
        <span className="font-medium">
          {i18n.t('ui.accounttreeselect.allAccounts')}
        </span>
        {selected.size === 0 && (
          <span className="text-xs font-semibold text-accent">
            {i18n.t('ui.accounttreeselect.selected')}
          </span>
        )}
      </button>

      <div className="border-t border-border py-1.5">
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
      </div>
    </div>
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const containerRef = useCloseAccountTreeOnOutsideClick(open, setOpen)

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
    <div
      ref={containerRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation()
          setOpen(false)
          triggerRef.current?.focus()
        }
      }}
    >
      <div
        className={[
          'inline-flex items-center rounded-lg border text-xs transition-colors',
          hasSelection
            ? 'border-accent bg-accent-muted/40 text-accent'
            : 'border-border-strong bg-surface-raised text-content-muted hover:border-border-strong hover:text-content-secondary',
        ].join(' ')}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex items-center gap-1.5 py-1 pl-3 pr-1"
        >
          <span>{triggerLabel}</span>
          <span className="ml-0.5 text-content-subtle" aria-hidden="true">
            {open ? '▴' : '▾'}
          </span>
        </button>
        {hasSelection && (
          <button
            type="button"
            aria-label={i18n.t('ui.accounttreeselect.reset')}
            onClick={() => onChange(new Set())}
            className="px-2 py-1 text-accent hover:text-content"
            title={i18n.t('ui.accounttreeselect.reset')}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 min-w-48 bg-surface-raised border border-border-strong rounded-lg shadow-xl py-1.5 max-h-72 overflow-y-auto">
          {/* Select all row */}
          <div className="border-b border-border-strong pb-1 mb-1">
            <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-hover cursor-pointer">
              <IndeterminateCheckbox
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
              <span className="text-xs font-semibold text-content-secondary">
                {i18n.t('ui.accounttreeselect.selectAll')}
              </span>
            </label>
          </div>
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
        </div>
      )}
    </div>
  )
}
