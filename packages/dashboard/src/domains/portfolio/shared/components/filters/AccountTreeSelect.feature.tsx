import i18n from '@/i18n/i18n'
import { useState } from 'react'
import { accountLabel, toggle } from './helpers/filters/portfolioFilters'
import { IndeterminateCheckbox } from './IndeterminateCheckbox.view'
import {
  accountsForType,
  accountTypeSelectionState,
  buildAccountSelectionLabel,
  toggleAccountTypeSelection,
} from '@/domains/portfolio/shared/helpers/filters/accountTreeSelection'
import { useCloseAccountTreeOnOutsideClick } from './services/useCloseAccountTreeOnOutsideClick'

interface AccountTreeProps {
  allAccountTypes: string[]
  accountToType: Record<string, string>
  allAccounts: string[]
  accountLabels: Record<string, string>
  selected: Set<string>
  onChange: (next: Set<string>) => void
}

function TreeAccountRow({ account, accountLabels, onChange, selected }: { account: string; accountLabels: Record<string, string>; onChange: (next: Set<string>) => void; selected: Set<string> }) {
  return <label className="flex cursor-pointer items-center gap-2 py-1.5 pl-8 pr-3 hover:bg-gray-800/80"><input type="checkbox" checked={selected.has(account)} onChange={() => onChange(toggle(selected, account))} className="h-3.5 w-3.5 cursor-pointer accent-blue-500" /><span className="min-w-0 truncate text-xs text-gray-300">{accountLabel(account, accountLabels)}</span></label>
}

function TreeAccountType({ accountLabels, accounts, onChange, selected, type }: { accountLabels: Record<string, string>; accounts: string[]; onChange: (next: Set<string>) => void; selected: Set<string>; type: string }) {
  if (accounts.length === 0) return null
  const { allSelected, partiallySelected, selectedCount } = accountTypeSelectionState(accounts, selected)
  return <div className="py-1"><label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-gray-800/80"><IndeterminateCheckbox checked={allSelected} indeterminate={partiallySelected} onChange={() => onChange(toggleAccountTypeSelection(accounts, selected))} /><span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{type}</span>{selectedCount > 0 && <span className="ml-auto text-[11px] tabular-nums text-gray-500">{selectedCount}/{accounts.length}</span>}</label>{accounts.map((account) => (
    // eslint-disable-next-line local/no-prop-drilling -- Account rows are direct children of their owning account-type group.
    <TreeAccountRow key={account} account={account} accountLabels={accountLabels} onChange={onChange} selected={selected} />
  ))}</div>
}

function SelectAccountRow({ account, accountLabels, onChange, selected }: { account: string; accountLabels: Record<string, string>; onChange: (next: Set<string>) => void; selected: Set<string> }) {
  return <label className="flex cursor-pointer items-center gap-2 py-1 pl-7 pr-3 hover:bg-gray-700"><input type="checkbox" checked={selected.has(account)} onChange={() => onChange(toggle(selected, account))} className="h-3.5 w-3.5 cursor-pointer accent-blue-500" /><span className="text-xs text-gray-400">{accountLabel(account, accountLabels)}</span></label>
}

function SelectAccountType({ accountLabels, accounts, onChange, selected, type }: { accountLabels: Record<string, string>; accounts: string[]; onChange: (next: Set<string>) => void; selected: Set<string>; type: string }) {
  if (accounts.length === 0) return null
  const { allSelected, partiallySelected } = accountTypeSelectionState(accounts, selected)
  return <div><label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-gray-700"><IndeterminateCheckbox checked={allSelected} indeterminate={partiallySelected} onChange={() => onChange(toggleAccountTypeSelection(accounts, selected))} /><span className="text-xs font-semibold text-gray-300">{type}</span></label>{accounts.map((account) => (
    // eslint-disable-next-line local/no-prop-drilling -- Account rows are direct children of their owning account-type group.
    <SelectAccountRow key={account} account={account} accountLabels={accountLabels} onChange={onChange} selected={selected} />
  ))}</div>
}

export function AccountTree({
  allAccountTypes, accountToType, allAccounts, accountLabels, selected, onChange,
}: AccountTreeProps) {
  const accountGroups = allAccountTypes.map((type) => ({
    accounts: accountsForType(type, allAccounts, accountToType),
    type,
  }))
  return (
    <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-950/35">
      <button
        type="button"
        onClick={() => onChange(new Set())}
        className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors ${selected.size === 0 ? 'bg-blue-900/35 text-blue-200' : 'text-gray-300 hover:bg-gray-800'}`}
      >
        <span className="font-medium">{i18n.t('ui.accounttreeselect.allAccounts')}</span>
        {selected.size === 0 && <span className="text-xs font-semibold text-blue-300">{i18n.t('ui.accounttreeselect.selected')}</span>}
      </button>

      <div className="border-t border-gray-800 py-1.5">
        {accountGroups.map((group) => <TreeAccountType key={group.type} accountLabels={accountLabels} accounts={group.accounts} onChange={onChange} selected={selected} type={group.type} />)}
      </div>
    </div>
  )
}

export function AccountTreeSelect({
  allAccountTypes, accountToType, allAccounts, accountLabels, selected, onChange,
}: AccountTreeProps) {
  const [open, setOpen] = useState(false)
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
  const accountGroups = allAccountTypes.map((type) => ({ accounts: typeAccounts(type), type }))

  return (
    <div ref={containerRef} className="relative">
      <div className={[
        'inline-flex items-center rounded-lg border text-xs transition-colors',
        hasSelection
          ? 'border-blue-600 bg-blue-900/40 text-blue-200'
          : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-400 hover:text-gray-200',
      ].join(' ')}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex items-center gap-1.5 py-1 pl-3 pr-1"
        >
          <span>{triggerLabel}</span>
          <span className="ml-0.5 text-gray-500" aria-hidden="true">{open ? '▴' : '▾'}</span>
        </button>
        {hasSelection && (
          <button
            type="button"
            aria-label={i18n.t('ui.accounttreeselect.reset')}
            onClick={() => onChange(new Set())}
            className="px-2 py-1 text-blue-400 hover:text-white"
            title={i18n.t('ui.accounttreeselect.reset')}
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 min-w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1.5 max-h-72 overflow-y-auto">
          {/* Select all row */}
          <div className="border-b border-gray-700 pb-1 mb-1">
            <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-700 cursor-pointer">
              <IndeterminateCheckbox
                checked={selected.size === allAccounts.length && allAccounts.length > 0}
                indeterminate={selected.size > 0 && selected.size < allAccounts.length}
                onChange={() => {
                  if (selected.size === allAccounts.length) onChange(new Set())
                  else onChange(new Set(allAccounts))
                }}
              />
              <span className="text-xs font-semibold text-gray-200">{i18n.t('ui.accounttreeselect.selectAll')}</span>
            </label>
          </div>
          {accountGroups.map((group) => <SelectAccountType key={group.type} accountLabels={accountLabels} accounts={group.accounts} onChange={onChange} selected={selected} type={group.type} />)}
        </div>
      )}
    </div>
  )
}
