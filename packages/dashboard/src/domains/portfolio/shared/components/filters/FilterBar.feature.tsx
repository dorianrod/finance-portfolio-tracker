import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import {
  clearFilterGroup,
  type FilterSummaryItem,
  type FilterVisibility,
  presetDateFrom,
  toggle,
} from '@/domains/portfolio/shared/helpers/filters/portfolioFilters'
import { useDashboardFilters } from '@/domains/portfolio/shared/services/actions/useDashboardFilters'
import { usePortfolioFilterOptions } from '@/domains/portfolio/shared/services/usePortfolioFilterOptions'
import {
  dashboardFiltersAtom,
  dashboardFiltersOpenAtom,
} from '@/domains/portfolio/shared/stores/dashboardFilters.atoms'
import type { OperationType } from '@/domains/portfolio/shared/types/operationType.type'
import i18n from '@/i18n/i18n'
import { toDateInputValue } from '@/shared/helpers/mappers/toDateInputValue'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { DATE_FILTER_SCHEMA } from '@/shared/schemas/calendarDate.schema'
import { SelectionCount } from '@/shared/ui/Badge.view'
import { Checkbox } from '@/shared/ui/Checkbox.view'
import {
  Button,
  Decorative,
  DialogButton,
  Group,
  Input,
} from '@/shared/ui/Controls.view'
import {
  ChoiceRow,
  FieldSeparator,
  FilterIcon,
} from '@/shared/ui/FormElements.view'
import { SidePanel } from '@/shared/ui/SidePanel.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { AccountTree } from './AccountTreeSelect.feature'
import { Chip } from './Chip.view'
import { FilterSection } from './FilterSection.view'

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
    <Button
      type="button"
      onClick={() =>
        setFilters((current) => clearFilterGroup(current, item.key))
      }
      title={i18n.t('ui.filterbar.clearValue0Filter', { value0: item.key })}
      variant="filterTag"
      className="inline-flex max-w-full items-center gap-1.5 px-3 py-1"
    >
      <Text truncate>{item.label}</Text>
      <Decorative>×</Decorative>
    </Button>
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
      onClose={closeFilters}
      closeLabel={i18n.t('ui.filterbar.closeFilters')}
    >
      <SidePanel.Title>{i18n.t('ui.filterbar.filters')}</SidePanel.Title>
      <SidePanel.Description>
        {i18n.t('ui.filterbar.changesUpdateTheDashboardImmediately')}
      </SidePanel.Description>
      <SidePanel.HeaderActions>
        <Button
          type="button"
          onClick={resetDashboardFilters}
          variant="quiet"
          className="shrink-0 px-2 py-1"
        >
          {i18n.t('ui.filterbar.resetAll')}
        </Button>
      </SidePanel.HeaderActions>
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
            <Input
              type="date"
              label={i18n.t('ui.filterbar.periodStart')}
              value={toDateInputValue(filters.dateFrom)}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  dateFrom: DATE_FILTER_SCHEMA.validateSync(event.target.value),
                })
              }
              variant="filter"
              className="min-w-0 flex-1 px-2.5 py-2"
            />
            <FieldSeparator />
            <Input
              type="date"
              label={i18n.t('ui.filterbar.periodEnd')}
              value={toDateInputValue(filters.dateTo)}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  dateTo: DATE_FILTER_SCHEMA.validateSync(event.target.value),
                })
              }
              variant="filter"
              className="min-w-0 flex-1 px-2.5 py-2"
            />
          </div>
          {hasPeriodFilter && (
            <Button
              type="button"
              onClick={() =>
                setFilters({
                  ...filters,
                  dateFrom: undefined,
                  dateTo: undefined,
                })
              }
              variant="text"
              className="mt-2"
            >
              {i18n.t('ui.filterbar.clearPeriod')}
            </Button>
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
            <Surface
              variant="raisedInset"
              className="mt-3 flex items-center justify-between gap-3 px-3 py-2.5"
            >
              <div>
                <Text as="div" variant="captionLabel" tone="secondary">
                  {i18n.t('ui.filterbar.staticDemo')}
                </Text>
                <Text as="div" variant="micro" tone="subtle" className="mt-0.5">
                  {i18n.t('ui.filterbar.useThePrecomputedFilteredReturnSample')}
                </Text>
              </div>
              <Button
                type="button"
                onClick={() =>
                  setFilters({
                    ...filters,
                    accounts: demoPresetSelection,
                    accountTypes: new Set(),
                  })
                }
                variant="preset"
                selected={demoPresetActive}
                className="shrink-0 px-2.5 py-1"
              >
                {i18n.t('ui.filterbar.excludePrivateEquity')}
              </Button>
            </Surface>
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
          <Text as="div" variant="captionLabel" tone="muted">
            {i18n.t('ui.filterbar.operationType')}
          </Text>
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
          <ChoiceRow
            variant="card"
            className="mt-4 flex items-center justify-between gap-3 px-3 py-2.5"
          >
            <span>
              <Text variant="captionLabel" tone="secondary" className="block">
                {i18n.t('ui.filterbar.hideClosedPositions')}
              </Text>
              <Text variant="micro" tone="subtle" className="mt-0.5 block">
                {i18n.t('ui.filterbar.keepTheTableFocusedOnCurrentHoldings')}
              </Text>
            </span>
            <Checkbox
              size="standard"
              checked={filters.hideClosedPositions}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  hideClosedPositions: event.target.checked,
                })
              }
              className="shrink-0"
            />
          </ChoiceRow>
        </FilterSection>
      )}
    </SidePanel>
  )
}

export function FilterButton({ activeCount }: { activeCount: number }) {
  const open = useAtomValue(dashboardFiltersOpenAtom)
  const { openFilters } = useDashboardFilters()

  return (
    <DialogButton
      type="button"
      onClick={openFilters}
      expanded={open}
      variant="filter"
      selected={activeCount > 0}
      className="inline-flex shrink-0 items-center gap-2 px-3 py-2"
    >
      <FilterIcon className="h-4 w-4" />
      <span>{i18n.t('ui.filterbar.filters')}</span>
      {activeCount > 0 && (
        <SelectionCount className="min-w-5 px-1.5 py-0.5">
          {activeCount}
        </SelectionCount>
      )}
    </DialogButton>
  )
}

export function ActiveFilterSummary({
  items,
  children,
}: {
  items: FilterSummaryItem[]
  children?: ReactNode
}) {
  const { slot: leading, content: afterLeading } = partitionSlot(
    children,
    ActiveFilterLeading,
  )
  const { slot: actions, content } = partitionSlot(
    afterLeading,
    ActiveFilterActions,
  )
  if (
    items.length === 0 &&
    leading.length === 0 &&
    content.length === 0 &&
    actions.length === 0
  )
    return null

  return (
    <Group
      className="mb-4 flex flex-wrap items-center gap-2"
      label={i18n.t('ui.filterbar.activeFilters')}
    >
      {leading}
      {items.map((item) => (
        <ActiveFilterChip key={item.key} item={item} />
      ))}
      {content}
      {actions}
    </Group>
  )
}

export function ResetFiltersButton() {
  const { resetDashboardFilters } = useDashboardFilters()

  return (
    <Button
      type="button"
      onClick={resetDashboardFilters}
      variant="text"
      className="px-1 py-1"
    >
      {i18n.t('ui.filterbar.resetAll')}
    </Button>
  )
}

function ActiveFilterLeading({ children }: { children: ReactNode }) {
  return children
}
function ActiveFilterActions({ children }: { children: ReactNode }) {
  return children
}
ActiveFilterSummary.Leading = ActiveFilterLeading
ActiveFilterSummary.Actions = ActiveFilterActions
