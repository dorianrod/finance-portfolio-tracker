import { useEffect, useRef, useState } from 'react'
import { accountLabel, toggle } from './filterBar.logic'
import { IndeterminateCheckbox } from './IndeterminateCheckbox'

interface AccountTreeProps {
  allAccountTypes: string[]
  accountToType: Record<string, string>
  allAccounts: string[]
  accountLabels: Record<string, string>
  selected: Set<string>
  onChange: (next: Set<string>) => void
}

export function AccountTree({
  allAccountTypes, accountToType, allAccounts, accountLabels, selected, onChange,
}: AccountTreeProps) {
  function typeAccounts(type: string) {
    return allAccounts.filter((account) => accountToType[account] === type)
  }

  function toggleType(type: string) {
    const accounts = typeAccounts(type)
    const allSelected = accounts.every((account) => selected.has(account))
    const next = new Set(selected)
    if (allSelected) accounts.forEach((account) => next.delete(account))
    else accounts.forEach((account) => next.add(account))
    onChange(next)
  }

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
        {allAccountTypes.map((type) => {
          const accounts = typeAccounts(type)
          if (accounts.length === 0) return null
          const selectedCount = accounts.filter((account) => selected.has(account)).length
          const allSelected = selectedCount === accounts.length
          const partiallySelected = selectedCount > 0 && !allSelected

          return (
            <div key={type} className="py-1">
              <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-gray-800/80">
                <IndeterminateCheckbox
                  checked={allSelected}
                  indeterminate={partiallySelected}
                  onChange={() => toggleType(type)}
                />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{type}</span>
                {selectedCount > 0 && (
                  <span className="ml-auto text-[11px] tabular-nums text-gray-500">{selectedCount}/{accounts.length}</span>
                )}
              </label>
              {accounts.map((account) => (
                <label
                  key={account}
                  className="flex cursor-pointer items-center gap-2 py-1.5 pl-8 pr-3 hover:bg-gray-800/80"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(account)}
                    onChange={() => onChange(toggle(selected, account))}
                    className="h-3.5 w-3.5 cursor-pointer accent-blue-500"
                  />
                  <span className="min-w-0 truncate text-xs text-gray-300">
                    {accountLabel(account, accountLabels)}
                  </span>
                </label>
              ))}
            </div>
          )
        })}
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
    return allAccounts.filter((a) => accountToType[a] === type)
  }

  function toggleType(type: string) {
    const accs = typeAccounts(type)
    const allSel = accs.every((a) => selected.has(a))
    const next = new Set(selected)
    if (allSel) accs.forEach((a) => next.delete(a))
    else accs.forEach((a) => next.add(a))
    onChange(next)
  }

  function toggleAccount(account: string) {
    onChange(toggle(selected, account))
  }

  // Trigger label
  function triggerLabel() {
    if (selected.size === 0) return 'All accounts'
    // Check if entire types are selected
    const fullTypes = allAccountTypes.filter((t) => {
      const accs = typeAccounts(t)
      return accs.length > 0 && accs.every((a) => selected.has(a))
    })
    const partialAccounts = [...selected].filter((a) => {
      const t = accountToType[a]
      return !t || !fullTypes.includes(t)
    })
    const parts: string[] = [
      ...fullTypes,
      ...partialAccounts.map((a) => accountLabel(a, accountLabels)),
    ]
    if (parts.length <= 2) return parts.join(', ')
    return `${parts.slice(0, 2).join(', ')} +${parts.length - 2}`
  }

  const hasSelection = selected.size > 0

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
        <span>{triggerLabel()}</span>
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
          {allAccountTypes.map((type) => {
            const accs = typeAccounts(type)
            if (accs.length === 0) return null
            const selCount = accs.filter((a) => selected.has(a)).length
            const isAll = selCount === accs.length
            const isPartial = selCount > 0 && !isAll
            return (
              <div key={type}>
                {/* Type row */}
                <label className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-700 cursor-pointer">
                  <IndeterminateCheckbox
                    checked={isAll}
                    indeterminate={isPartial}
                    onChange={() => toggleType(type)}
                  />
                  <span className="text-xs font-semibold text-gray-300">{type}</span>
                </label>
                {/* Account rows */}
                {accs.map((a) => (
                  <label
                    key={a}
                    className="flex items-center gap-2 pl-7 pr-3 py-1 hover:bg-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(a)}
                      onChange={() => toggleAccount(a)}
                      className="w-3.5 h-3.5 accent-blue-500 cursor-pointer"
                    />
                    <span className="text-xs text-gray-400">{accountLabel(a, accountLabels)}</span>
                  </label>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
