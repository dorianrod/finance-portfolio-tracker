import type { Filters } from '@/types/filters'
import { toggle, presetDateFrom } from './filterBar.logic'
import { AccountTreeSelect } from './AccountTreeSelect'
import { Chip } from './Chip'

interface Props {
  allAccountTypes: string[]
  accountToType: Record<string, string>
  allAccounts: string[]
  accountLabels: Record<string, string>
  allOperationTypes: string[]
  filters: Filters
  onChange: (f: Filters) => void
}

const OP_LABELS: Record<string, string> = {
  BUY: 'Buy',
  SELL: 'Sell',
  DIVIDEND: 'Dividend',
  INTEREST: 'Interest',
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdrawal',
}

const DATE_PRESETS = [
  { label: 'This month', months: 0 },
  { label: '3 months',  months: 3 },
  { label: '6 months',  months: 6 },
  { label: '1 year',    months: 12 },
] as const

const dateInputClass =
  'bg-gray-800 border border-gray-600 text-gray-300 text-xs rounded px-2 py-1 ' +
  'focus:outline-none focus:border-blue-500 [color-scheme:dark]'

export function FilterBar({
  allAccountTypes, accountToType, allAccounts, accountLabels,
  allOperationTypes, filters, onChange,
}: Props) {
  const hasDateFilter = !!(filters.dateFrom || filters.dateTo)

  function applyPreset(months: number) {
    const dateFrom = presetDateFrom(months)
    if (filters.dateFrom === dateFrom && !filters.dateTo)
      onChange({ ...filters, dateFrom: undefined, dateTo: undefined })
    else
      onChange({ ...filters, dateFrom, dateTo: undefined })
  }

  return (
    <div className="flex flex-col gap-2 mb-4">
      {/* Accounts */}
      {allAccounts.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider w-16 shrink-0">Accounts</span>
          <AccountTreeSelect
            allAccountTypes={allAccountTypes}
            accountToType={accountToType}
            allAccounts={allAccounts}
            accountLabels={accountLabels}
            selected={filters.accounts}
            onChange={(next) => onChange({ ...filters, accounts: next, accountTypes: new Set() })}
          />
        </div>
      )}

      {/* Operations + hide closed */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Operation type</span>
          <div className="flex gap-1.5">
            <Chip
              label="All"
              active={filters.operationTypes.size === 0}
              onClick={() => onChange({ ...filters, operationTypes: new Set() })}
            />
            {allOperationTypes.map((t) => (
              <Chip
                key={t}
                label={OP_LABELS[t] ?? t}
                active={filters.operationTypes.has(t)}
                onClick={() => onChange({ ...filters, operationTypes: toggle(filters.operationTypes, t) })}
              />
            ))}
          </div>
        </div>

        <div className="w-px h-4 bg-gray-700" />

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.hideClosedPositions}
            onChange={(e) => onChange({ ...filters, hideClosedPositions: e.target.checked })}
            className="w-3.5 h-3.5 accent-blue-500"
          />
          <span className="text-xs text-gray-400">Hide closed</span>
        </label>
      </div>

      {/* Period */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500 uppercase tracking-wider w-16 shrink-0">Period</span>
        <div className="flex gap-1.5">
          {DATE_PRESETS.map((p) => (
            <Chip
              key={p.label}
              label={p.label}
              active={filters.dateFrom === presetDateFrom(p.months) && !filters.dateTo}
              onClick={() => applyPreset(p.months)}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-1">
          <input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
            className={dateInputClass}
          />
          <span className="text-gray-600 text-xs">→</span>
          <input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
            className={dateInputClass}
          />
          {hasDateFilter && (
            <button
              onClick={() => onChange({ ...filters, dateFrom: undefined, dateTo: undefined })}
              className="ml-1 text-gray-500 hover:text-gray-200 text-sm leading-none transition-colors cursor-pointer"
              title="Clear date filter"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
