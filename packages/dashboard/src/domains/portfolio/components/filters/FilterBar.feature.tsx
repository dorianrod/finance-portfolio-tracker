import i18n from '@/i18n/i18n'
import type { ReactNode } from 'react'
import { useAtomValue } from 'jotai'
import { useDashboardFilters } from '@/domains/portfolio/pages/dashboard/services/actions/useDashboardFilters'
import {
  dashboardFiltersAtom,
  dashboardFiltersOpenAtom,
} from '@/domains/portfolio/pages/dashboard/stores/dashboardFilters.atoms'
import { usePortfolioFilterOptions } from '@/domains/portfolio/services/usePortfolioFilterOptions'
import { SidePanel } from '@/shared/ui/SidePanel.view'
import { AccountTree } from './AccountTreeSelect.feature'
import { Chip } from './Chip.view'
import {
  clearFilterGroup,
  presetDateFrom,
  toggle,
  type FilterSummaryItem,
  type FilterVisibility,
} from './helpers/filters/portfolioFilters'

interface FilterPanelProps {
  visibility: FilterVisibility
  demoPresetSelection?: Set<string> | null
  demoPresetActive?: boolean
}

const OP_LABELS: Record<string, string> = {
  BUY: i18n.t('ui.filterbar.buy'),
  SELL: i18n.t('ui.filterbar.sell'),
  DIVIDEND: i18n.t('ui.filterbar.dividend'),
  INTEREST: i18n.t('ui.filterbar.interest'),
  DEPOSIT: i18n.t('ui.filterbar.deposit'),
  WITHDRAWAL: i18n.t('ui.filterbar.withdrawal'),
}

const DATE_PRESETS = [
  { label: i18n.t('ui.filterbar.thisMonth'), months: 0 },
  { label: i18n.t('ui.filterbar.3Months'), months: 3 },
  { label: i18n.t('ui.filterbar.6Months'), months: 6 },
  { label: i18n.t('ui.filterbar.1Year'), months: 12 },
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

function DatePresetChip({ preset }: { preset: (typeof DATE_PRESETS)[number] }) {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { setFilters } = useDashboardFilters()
  const dateFrom = presetDateFrom(preset.months)
  function applyPreset() {
    setFilters(filters.dateFrom === dateFrom && !filters.dateTo ? { ...filters, dateFrom: undefined, dateTo: undefined } : { ...filters, dateFrom, dateTo: undefined })
  }
  return <Chip label={preset.label} active={filters.dateFrom === dateFrom && !filters.dateTo} onClick={applyPreset} />
}

function OperationTypeChip({ operation }: { operation: string }) {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { setFilters } = useDashboardFilters()
  return <Chip label={OP_LABELS[operation] ?? operation} active={filters.operationTypes.has(operation)} onClick={() => setFilters({ ...filters, operationTypes: toggle(filters.operationTypes, operation) })} />
}

function ActiveFilterChip({ item }: { item: FilterSummaryItem }) {
  const { setFilters } = useDashboardFilters()
  return <button type="button" onClick={() => setFilters((current) => clearFilterGroup(current, item.key))} title={i18n.t('ui.filterbar.clearValue0Filter', { value0: item.key })} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-500 bg-blue-900/35 px-3 py-1 text-xs text-blue-200 transition-colors hover:bg-blue-900/55"><span className="truncate">{item.label}</span><span aria-hidden="true" className="text-blue-400">×</span></button>
}

export function FilterPanel({
  visibility,
  demoPresetSelection,
  demoPresetActive = false,
}: FilterPanelProps) {
  const filters = useAtomValue(dashboardFiltersAtom)
  const open = useAtomValue(dashboardFiltersOpenAtom)
  const { closeFilters, resetDashboardFilters, setFilters } = useDashboardFilters()
  const {
    accountFilterLabels,
    accountToType,
    allAccounts,
    allAccountTypes,
    allOperationTypes,
  } = usePortfolioFilterOptions()
  if (!open) return null
  const hasPeriodFilter = Boolean(filters.dateFrom || filters.dateTo)

  return (
    <SidePanel
      title={i18n.t('ui.filterbar.filters')}
      description={i18n.t('ui.filterbar.changesUpdateTheDashboardImmediately')}
      onClose={closeFilters}
      closeLabel={i18n.t('ui.filterbar.closeFilters')}
      headerActions={(
        <button
          type="button"
          onClick={resetDashboardFilters}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-200"
        >

          {i18n.t('ui.filterbar.resetAll')}
        </button>
      )}
    >
      {visibility.showPeriod && (
        <FilterSection title={i18n.t('ui.filterbar.period')} description={i18n.t('ui.filterbar.limitTimeBasedChartsAndCalculationsToASpecific')}>
          <div className="flex flex-wrap gap-1.5">
            {DATE_PRESETS.map((preset) => <DatePresetChip key={preset.label} preset={preset} />)}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="date"
              aria-label={i18n.t('ui.filterbar.periodStart')}
              value={filters.dateFrom ?? ''}
              onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value || undefined })}
              className={dateInputClass}
            />
            <span aria-hidden="true" className="text-xs text-gray-600">→</span>
            <input
              type="date"
              aria-label={i18n.t('ui.filterbar.periodEnd')}
              value={filters.dateTo ?? ''}
              onChange={(event) => setFilters({ ...filters, dateTo: event.target.value || undefined })}
              className={dateInputClass}
            />
          </div>
          {hasPeriodFilter && (
            <button
              type="button"
              onClick={() => setFilters({ ...filters, dateFrom: undefined, dateTo: undefined })}
              className="mt-2 text-xs font-medium text-gray-500 transition-colors hover:text-gray-200"
            >

              {i18n.t('ui.filterbar.clearPeriod')}
            </button>
          )}
        </FilterSection>
      )}

      {allAccounts.length > 0 && (
        <FilterSection title={i18n.t('ui.filterbar.accounts')} description={i18n.t('ui.filterbar.chooseThePortfolioScopeUsedAcrossEveryView')}>
          <AccountTree
            allAccountTypes={allAccountTypes}
            accountToType={accountToType}
            allAccounts={allAccounts}
            accountLabels={accountFilterLabels}
            selected={filters.accounts}
            onChange={(accounts) => setFilters({ ...filters, accounts, accountTypes: new Set() })}
          />
          {demoPresetSelection && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-gray-800/60 px-3 py-2.5">
              <div>
                <div className="text-xs font-medium text-gray-300">{i18n.t('ui.filterbar.staticDemo')}</div>
                <div className="mt-0.5 text-[11px] text-gray-500">{i18n.t('ui.filterbar.useThePrecomputedFilteredReturnSample')}</div>
              </div>
              <button
                type="button"
                onClick={() => setFilters({ ...filters, accounts: demoPresetSelection, accountTypes: new Set() })}
                className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs transition-colors ${demoPresetActive ? 'border-blue-600 bg-blue-900/40 text-blue-200' : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200'}`}
              >

                {i18n.t('ui.filterbar.excludePrivateEquity')}
              </button>
            </div>
          )}
        </FilterSection>
      )}

      {visibility.showPositionFilters && (
        <FilterSection title={i18n.t('ui.filterbar.positions')} description={i18n.t('ui.filterbar.refineTheTransactionsAndHoldingsShownInTheTable')}>
          <div className="text-xs font-medium text-gray-400">{i18n.t('ui.filterbar.operationType')}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip
              label={i18n.t('ui.filterbar.all')}
              active={filters.operationTypes.size === 0}
              onClick={() => setFilters({ ...filters, operationTypes: new Set() })}
            />
            {allOperationTypes.map((operation) => <OperationTypeChip key={operation} operation={operation} />)}
          </div>
          <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-700 bg-gray-950/35 px-3 py-2.5">
            <span>
              <span className="block text-xs font-medium text-gray-300">{i18n.t('ui.filterbar.hideClosedPositions')}</span>
              <span className="mt-0.5 block text-[11px] text-gray-500">{i18n.t('ui.filterbar.keepTheTableFocusedOnCurrentHoldings')}</span>
            </span>
            <input
              type="checkbox"
              checked={filters.hideClosedPositions}
              onChange={(event) => setFilters({ ...filters, hideClosedPositions: event.target.checked })}
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
}: {
  activeCount: number
}) {
  const open = useAtomValue(dashboardFiltersOpenAtom)
  const { openFilters } = useDashboardFilters()

  return (
    <button
      type="button"
      onClick={openFilters}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${activeCount > 0 ? 'border-blue-600 bg-blue-900/30 text-blue-200 hover:bg-blue-900/45' : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-gray-200'}`}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
        <path d="M3 5h14M5.5 10h9M8 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <span>{i18n.t('ui.filterbar.filters')}</span>
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
  leading,
  children,
  actions,
}: {
  items: FilterSummaryItem[]
  leading?: ReactNode
  children?: ReactNode
  actions?: ReactNode
}) {
  if (items.length === 0 && !leading && !children && !actions) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" aria-label={i18n.t('ui.filterbar.activeFilters')}>
      {leading}
      {items.map((item) => <ActiveFilterChip key={item.key} item={item} />)}
      {children}
      {actions}
    </div>
  )
}

export function ResetFiltersButton() {
  const { resetDashboardFilters } = useDashboardFilters()

  return (
    <button
      type="button"
      onClick={resetDashboardFilters}
      className="px-1 py-1 text-xs font-medium text-gray-500 transition-colors hover:text-gray-200"
    >

      {i18n.t('ui.filterbar.resetAll')}
    </button>
  )
}
