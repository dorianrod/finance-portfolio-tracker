import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import { useDashboardFilters } from '@/domains/portfolio/shared/services/actions/useDashboardFilters'
import { usePortfolioFilterOptions } from '@/domains/portfolio/shared/services/usePortfolioFilterOptions'
import {
  dashboardFiltersAtom,
  dashboardFiltersOpenAtom,
} from '@/domains/portfolio/shared/stores/dashboardFilters.atoms'
import type { OperationType } from '@/domains/portfolio/shared/types/operationType.type'
import i18n from '@/i18n/i18n'
import { toDateInputValue } from '@/shared/helpers/mappers/toDateInputValue'
import { DATE_FILTER_SCHEMA } from '@/shared/schemas/calendarDate.schema'
import { SidePanel } from '@/shared/ui/SidePanel.view'

import { AccountTree } from './AccountTreeSelect.feature'
import { Chip } from './Chip.view'
import { FilterSection } from './FilterSection.view'
import {
  clearFilterGroup,
  type FilterSummaryItem,
  type FilterVisibility,
  presetDateFrom,
  toggle,
} from './helpers/filters/portfolioFilters'

type FilterPanelProps = {
  visibility: FilterVisibility
  demoPresetSelection?: Set<string> | null
  demoPresetActive?: boolean
}

const OP_LABELS: Record<OperationType, string> = {
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
  'min-w-0 flex-1 bg-surface-raised border border-border-strong text-content-secondary text-xs rounded-lg px-2.5 py-2 ' +
  'focus:outline-none focus:border-accent'

function DatePresetChip({ preset }: { preset: (typeof DATE_PRESETS)[number] }) {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { setFilters } = useDashboardFilters()
  const dateFrom = presetDateFrom(preset.months)
  function applyPreset() {
    setFilters(
      filters.dateFrom?.getTime() === dateFrom.getTime() && !filters.dateTo
        ? { ...filters, dateFrom: undefined, dateTo: undefined }
        : { ...filters, dateFrom, dateTo: undefined },
    )
  }
  return (
    <Chip
      label={preset.label}
      active={
        filters.dateFrom?.getTime() === dateFrom.getTime() && !filters.dateTo
      }
      onClick={applyPreset}
    />
  )
}

function OperationTypeChip({ operation }: { operation: OperationType }) {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { setFilters } = useDashboardFilters()
  return (
    <Chip
      label={OP_LABELS[operation]}
      active={filters.operationTypes.has(operation)}
      onClick={() =>
        setFilters({
          ...filters,
          operationTypes: toggle(filters.operationTypes, operation),
        })
      }
    />
  )
}

function ActiveFilterChip({ item }: { item: FilterSummaryItem }) {
  const { setFilters } = useDashboardFilters()
  return (
    <button
      type="button"
      onClick={() =>
        setFilters((current) => clearFilterGroup(current, item.key))
      }
      title={i18n.t('ui.filterbar.clearValue0Filter', { value0: item.key })}
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-accent bg-accent-muted/35 px-3 py-1 text-xs text-accent transition-colors hover:bg-accent-muted/55"
    >
      <span className="truncate">{item.label}</span>
      <span aria-hidden="true" className="text-accent">
        ×
      </span>
    </button>
  )
}

export function FilterPanel({
  visibility,
  demoPresetSelection,
  demoPresetActive = false,
}: FilterPanelProps) {
  const filters = useAtomValue(dashboardFiltersAtom)
  const open = useAtomValue(dashboardFiltersOpenAtom)
  const { closeFilters, resetDashboardFilters, setFilters } =
    useDashboardFilters()
  const {
    accountFilterLabels,
    accountToType,
    allAccounts,
    allAccountTypes,
    allOperationTypes,
  } = usePortfolioFilterOptions()
  const hasPeriodFilter = Boolean(filters.dateFrom || filters.dateTo)

  return (
    <SidePanel
      open={open}
      title={i18n.t('ui.filterbar.filters')}
      description={i18n.t('ui.filterbar.changesUpdateTheDashboardImmediately')}
      onClose={closeFilters}
      closeLabel={i18n.t('ui.filterbar.closeFilters')}
      headerActions={
        <button
          type="button"
          onClick={resetDashboardFilters}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-content-subtle transition-colors hover:bg-surface-raised hover:text-content-secondary"
        >
          {i18n.t('ui.filterbar.resetAll')}
        </button>
      }
    >
      {visibility.showPeriod && (
        <FilterSection
          title={i18n.t('ui.filterbar.period')}
          description={i18n.t(
            'ui.filterbar.limitTimeBasedChartsAndCalculationsToASpecific',
          )}
        >
          <div className="flex flex-wrap gap-1.5">
            {DATE_PRESETS.map((preset) => (
              <DatePresetChip key={preset.label} preset={preset} />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="date"
              aria-label={i18n.t('ui.filterbar.periodStart')}
              value={toDateInputValue(filters.dateFrom)}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  dateFrom: DATE_FILTER_SCHEMA.validateSync(event.target.value),
                })
              }
              className={dateInputClass}
            />
            <span aria-hidden="true" className="text-xs text-content-subtle">
              →
            </span>
            <input
              type="date"
              aria-label={i18n.t('ui.filterbar.periodEnd')}
              value={toDateInputValue(filters.dateTo)}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  dateTo: DATE_FILTER_SCHEMA.validateSync(event.target.value),
                })
              }
              className={dateInputClass}
            />
          </div>
          {hasPeriodFilter && (
            <button
              type="button"
              onClick={() =>
                setFilters({
                  ...filters,
                  dateFrom: undefined,
                  dateTo: undefined,
                })
              }
              className="mt-2 text-xs font-medium text-content-subtle transition-colors hover:text-content-secondary"
            >
              {i18n.t('ui.filterbar.clearPeriod')}
            </button>
          )}
        </FilterSection>
      )}

      {allAccounts.length > 0 && (
        <FilterSection
          title={i18n.t('ui.filterbar.accounts')}
          description={i18n.t(
            'ui.filterbar.chooseThePortfolioScopeUsedAcrossEveryView',
          )}
        >
          <AccountTree
            allAccountTypes={allAccountTypes}
            accountToType={accountToType}
            allAccounts={allAccounts}
            accountLabels={accountFilterLabels}
            selected={filters.accounts}
            onChange={(accounts) =>
              setFilters({ ...filters, accounts, accountTypes: new Set() })
            }
          />
          {demoPresetSelection && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-surface-raised/60 px-3 py-2.5">
              <div>
                <div className="text-xs font-medium text-content-secondary">
                  {i18n.t('ui.filterbar.staticDemo')}
                </div>
                <div className="mt-0.5 text-[11px] text-content-subtle">
                  {i18n.t('ui.filterbar.useThePrecomputedFilteredReturnSample')}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    ...filters,
                    accounts: demoPresetSelection,
                    accountTypes: new Set(),
                  })
                }
                className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs transition-colors ${demoPresetActive ? 'border-accent bg-accent-muted/40 text-accent' : 'border-border-strong text-content-muted hover:border-border-strong hover:text-content-secondary'}`}
              >
                {i18n.t('ui.filterbar.excludePrivateEquity')}
              </button>
            </div>
          )}
        </FilterSection>
      )}

      {visibility.showPositionFilters && (
        <FilterSection
          title={i18n.t('ui.filterbar.positions')}
          description={i18n.t(
            'ui.filterbar.refineTheTransactionsAndHoldingsShownInTheTable',
          )}
        >
          <div className="text-xs font-medium text-content-muted">
            {i18n.t('ui.filterbar.operationType')}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip
              label={i18n.t('ui.filterbar.all')}
              active={filters.operationTypes.size === 0}
              onClick={() =>
                setFilters({ ...filters, operationTypes: new Set() })
              }
            />
            {allOperationTypes.map((operation) => (
              <OperationTypeChip key={operation} operation={operation} />
            ))}
          </div>
          <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border-strong bg-canvas/35 px-3 py-2.5">
            <span>
              <span className="block text-xs font-medium text-content-secondary">
                {i18n.t('ui.filterbar.hideClosedPositions')}
              </span>
              <span className="mt-0.5 block text-[11px] text-content-subtle">
                {i18n.t('ui.filterbar.keepTheTableFocusedOnCurrentHoldings')}
              </span>
            </span>
            <input
              type="checkbox"
              checked={filters.hideClosedPositions}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  hideClosedPositions: event.target.checked,
                })
              }
              className="h-4 w-4 shrink-0 accent-accent"
            />
          </label>
        </FilterSection>
      )}
    </SidePanel>
  )
}

export function FilterButton({ activeCount }: { activeCount: number }) {
  const open = useAtomValue(dashboardFiltersOpenAtom)
  const { openFilters } = useDashboardFilters()

  return (
    <button
      type="button"
      onClick={openFilters}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${activeCount > 0 ? 'border-accent bg-accent-muted/30 text-accent hover:bg-accent-muted/45' : 'border-border-strong bg-surface text-content-muted hover:border-border-strong hover:text-content-secondary'}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="h-4 w-4"
      >
        <path
          d="M3 5h14M5.5 10h9M8 15h4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span>{i18n.t('ui.filterbar.filters')}</span>
      {activeCount > 0 && (
        <span className="min-w-5 rounded-full bg-accent-solid px-1.5 py-0.5 text-center text-[10px] font-bold leading-4 text-content">
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
    <div
      className="mb-4 flex flex-wrap items-center gap-2"
      aria-label={i18n.t('ui.filterbar.activeFilters')}
    >
      {leading}
      {items.map((item) => (
        <ActiveFilterChip key={item.key} item={item} />
      ))}
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
      className="px-1 py-1 text-xs font-medium text-content-subtle transition-colors hover:text-content-secondary"
    >
      {i18n.t('ui.filterbar.resetAll')}
    </button>
  )
}
