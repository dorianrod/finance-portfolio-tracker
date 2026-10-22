import { useEffect, useRef, useState } from 'react'
import { accountLabel, toggle } from './filterBar.logic'
import { IndeterminateCheckbox } from './IndeterminateCheckbox.view'
import {
  accountsForType,
  accountTypeSelectionState,
  buildAccountSelectionLabel,
  toggleAccountTypeSelection,
} from '@/domains/portfolio/helpers/filters/accountTreeSelection'

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
  return <div className="py-1"><label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-gray-800/80"><IndeterminateCheckbox checked={allSelected} indeterminate={partiallySelected} onChange={() => onChange(toggleAccountTypeSelection(accounts, selected))} /><span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{type}</span>{selectedCount > 0 && <span className="ml-auto text-[11px] tabular-nums text-gray-500">{selectedCount}/{accounts.length}</span>}</label>{accounts.map((account) => <TreeAccountRow key={account} account={account} accountLabels={accountLabels} onChange={onChange} selected={selected} />)}</div>
}

function SelectAccountRow({ account, accountLabels, onChange, selected }: { account: string; accountLabels: Record<string, string>; onChange: (next: Set<string>) => void; selected: Set<string> }) {
  return <label className="flex cursor-pointer items-center gap-2 py-1 pl-7 pr-3 hover:bg-gray-700"><input type="checkbox" checked={selected.has(account)} onChange={() => onChange(toggle(selected, account))} className="h-3.5 w-3.5 cursor-pointer accent-blue-500" /><span className="text-xs text-gray-400">{accountLabel(account, accountLabels)}</span></label>
}

function SelectAccountType({ accountLabels, accounts, onChange, selected, type }: { accountLabels: Record<string, string>; accounts: string[]; onChange: (next: Set<string>) => void; selected: Set<string>; type: string }) {
  if (accounts.length === 0) return null
  const { allSelected, partiallySelected } = accountTypeSelectionState(accounts, selected)
  return <div><label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-gray-700"><IndeterminateCheckbox checked={allSelected} indeterminate={partiallySelected} onChange={() => onChange(toggleAccountTypeSelection(accounts, selected))} /><span className="text-xs font-semibold text-gray-300">{type}</span></label>{accounts.map((account) => <SelectAccountRow key={account} account={account} accountLabels={accountLabels} onChange={onChange} selected={selected} />)}</div>
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
        <span className="font-medium">All accounts</span>
        {selected.size === 0 && <span className="text-xs font-semibold text-blue-300">Selected</span>}
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
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

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
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          'flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs transition-colors cursor-pointer',
          hasSelection
            ? 'bg-blue-900/40 border-blue-600 text-blue-200'
            : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200',
        ].join(' ')}
      >
        <span>{triggerLabel}</span>
        {hasSelection && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onChange(new Set()) }}
            className="ml-1 text-blue-400 hover:text-white leading-none"
            title="Reset"
          >
            ×
          </span>
        )}
        <span className="text-gray-500 ml-0.5">{open ? '▴' : '▾'}</span>
      </button>

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
              <span className="text-xs font-semibold text-gray-200">Select all</span>
            </label>
          </div>
          {accountGroups.map((group) => <SelectAccountType key={group.type} accountLabels={accountLabels} accounts={group.accounts} onChange={onChange} selected={selected} type={group.type} />)}
        </div>
      )}
    </div>
  )
}
