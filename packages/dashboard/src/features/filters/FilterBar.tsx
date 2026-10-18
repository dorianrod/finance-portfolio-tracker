import type { ReactNode } from 'react'
import type { Filters } from '@/types/filters'
import { SidePanel } from '@/shared/ui/SidePanel'
import { AccountTree } from './AccountTreeSelect'
import { Chip } from './Chip'
import {
  presetDateFrom,
  toggle,
  type FilterSummaryItem,
  type FilterVisibility,
} from './filterBar.logic'

interface FilterPanelProps {
  allAccountTypes: string[]
  accountToType: Record<string, string>
  allAccounts: string[]
  accountLabels: Record<string, string>
  allOperationTypes: string[]
  filters: Filters
  onChange: (filters: Filters) => void
  visibility: FilterVisibility
  open: boolean
  onClose: () => void
  onReset: () => void
  demoPresetSelection?: Set<string> | null
  demoPresetActive?: boolean
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
  { label: '3 months', months: 3 },
  { label: '6 months', months: 6 },
  { label: '1 year', months: 12 },
] as const

const dateInputClass =
  'min-w-0 flex-1 bg-gray-800 border border-gray-600 text-gray-300 text-xs rounded-lg px-2.5 py-2 ' +
  'focus:outline-none focus:border-blue-500 [color-scheme:dark]'

function FilterSection({ title, description, children }: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="border-b border-gray-800 px-4 py-5 last:border-b-0">
      <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
      {description && <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function FilterPanel({
  allAccountTypes,
  accountToType,
  allAccounts,
  accountLabels,
  allOperationTypes,
  filters,
  onChange,
  visibility,
  open,
  onClose,
  onReset,
  demoPresetSelection,
  demoPresetActive = false,
}: FilterPanelProps) {
  if (!open) return null

  function applyPreset(months: number) {
    const dateFrom = presetDateFrom(months)
    if (filters.dateFrom === dateFrom && !filters.dateTo) {
      onChange({ ...filters, dateFrom: undefined, dateTo: undefined })
    } else {
      onChange({ ...filters, dateFrom, dateTo: undefined })
    }
  }

  return (
    <SidePanel
      title="Filters"
      description="Changes update the dashboard immediately."
      onClose={onClose}
      closeLabel="Close filters"
      headerActions={(
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-200"
        >
          Reset all
        </button>
      )}
    >
      {allAccounts.length > 0 && (
        <FilterSection title="Accounts" description="Choose the portfolio scope used across every view.">
          <AccountTree
            allAccountTypes={allAccountTypes}
            accountToType={accountToType}
            allAccounts={allAccounts}
            accountLabels={accountLabels}
            selected={filters.accounts}
            onChange={(accounts) => onChange({ ...filters, accounts, accountTypes: new Set() })}
          />
          {demoPresetSelection && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-gray-800/60 px-3 py-2.5">
              <div>
                <div className="text-xs font-medium text-gray-300">Static demo</div>
                <div className="mt-0.5 text-[11px] text-gray-500">Use the precomputed filtered return sample.</div>
              </div>
              <button
                type="button"
                onClick={() => onChange({ ...filters, accounts: demoPresetSelection, accountTypes: new Set() })}
                className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs transition-colors ${demoPresetActive ? 'border-blue-600 bg-blue-900/40 text-blue-200' : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200'}`}
              >
                Exclude private equity
              </button>
            </div>
          )}
        </FilterSection>
      )}

      {visibility.showPeriod && (
        <FilterSection title="Period" description="Limit time-based charts and calculations to a specific range.">
          <div className="flex flex-wrap gap-1.5">
            {DATE_PRESETS.map((preset) => (
              <Chip
                key={preset.label}
                label={preset.label}
                active={filters.dateFrom === presetDateFrom(preset.months) && !filters.dateTo}
                onClick={() => applyPreset(preset.months)}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="date"
              aria-label="Period start"
              value={filters.dateFrom ?? ''}
              onChange={(event) => onChange({ ...filters, dateFrom: event.target.value || undefined })}
              className={dateInputClass}
            />
            <span aria-hidden="true" className="text-xs text-gray-600">→</span>
            <input
              type="date"
              aria-label="Period end"
              value={filters.dateTo ?? ''}
              onChange={(event) => onChange({ ...filters, dateTo: event.target.value || undefined })}
              className={dateInputClass}
            />
          </div>
          {(filters.dateFrom || filters.dateTo) && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, dateFrom: undefined, dateTo: undefined })}
              className="mt-2 text-xs font-medium text-gray-500 transition-colors hover:text-gray-200"
            >
              Clear period
            </button>
          )}
        </FilterSection>
      )}

      {visibility.showPositionFilters && (
        <FilterSection title="Positions" description="Refine the transactions and holdings shown in the table.">
          <div className="text-xs font-medium text-gray-400">Operation type</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip
              label="All"
              active={filters.operationTypes.size === 0}
              onClick={() => onChange({ ...filters, operationTypes: new Set() })}
            />
            {allOperationTypes.map((operation) => (
              <Chip
                key={operation}
                label={OP_LABELS[operation] ?? operation}
                active={filters.operationTypes.has(operation)}
                onClick={() => onChange({ ...filters, operationTypes: toggle(filters.operationTypes, operation) })}
              />
            ))}
          </div>
          <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-700 bg-gray-950/35 px-3 py-2.5">
            <span>
              <span className="block text-xs font-medium text-gray-300">Hide closed positions</span>
              <span className="mt-0.5 block text-[11px] text-gray-500">Keep the table focused on current holdings.</span>
            </span>
            <input
              type="checkbox"
              checked={filters.hideClosedPositions}
              onChange={(event) => onChange({ ...filters, hideClosedPositions: event.target.checked })}
              className="h-4 w-4 shrink-0 accent-blue-500"
            />
          </label>
        </FilterSection>
      )}
    </SidePanel>
  )
}

export function FilterButton({
  activeCount,
  open,
  onClick,
}: {
  activeCount: number
  open: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${activeCount > 0 ? 'border-blue-600 bg-blue-900/30 text-blue-200 hover:bg-blue-900/45' : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-gray-200'}`}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
        <path d="M3 5h14M5.5 10h9M8 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span>Filters</span>
      {activeCount > 0 && (
        <span className="min-w-5 rounded-full bg-blue-600 px-1.5 py-0.5 text-center text-[10px] font-bold leading-4 text-white">
          {activeCount}
        </span>
      )}
    </button>
  )
}

export function ActiveFilterSummary({
  items,
  onRemove,
  onReset,
  children,
}: {
  items: FilterSummaryItem[]
  onRemove: (item: FilterSummaryItem) => void
  onReset: () => void
  children?: ReactNode
}) {
  if (items.length === 0 && !children) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onRemove(item)}
          title={`Clear ${item.key} filter`}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-500 bg-blue-900/35 px-3 py-1 text-xs text-blue-200 transition-colors hover:bg-blue-900/55"
        >
          <span className="truncate">{item.label}</span>
          <span aria-hidden="true" className="text-blue-400">×</span>
        </button>
      ))}
      {children}
      <button
        type="button"
        onClick={onReset}
        className="px-1 py-1 text-xs font-medium text-gray-500 transition-colors hover:text-gray-200"
      >
        Reset all
      </button>
    </div>
  )
}
