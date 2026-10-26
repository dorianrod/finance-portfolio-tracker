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
import { Inline, Layout } from '@/shared/ui/Layout.view'
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
    <Layout as="span" flow="control">
      <Button
        type="button"
        onClick={() =>
          setFilters((current) => clearFilterGroup(current, item.key))
        }
        title={i18n.t('ui.filterbar.clearValue0Filter', { value0: item.key })}
        variant="filterTag"
      >
        <Text truncate>{item.label}</Text>
        <Decorative>×</Decorative>
      </Button>
    </Layout>
  )
}

export function FilterPanel({
  visibility,
  demoPresetSelection,
  demoPresetActive = false,
}: FilterPanelProps) {
  const open = useAtomValue(dashboardFiltersOpenAtom)
  const { closeFilters, resetDashboardFilters } = useDashboardFilters()

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
        <Layout as="span" flow="control" sizing="fixed">
          <Button type="button" onClick={resetDashboardFilters} variant="quiet">
            {i18n.t('ui.filterbar.resetAll')}
          </Button>
        </Layout>
      </SidePanel.HeaderActions>
      {visibility.showPeriod && <PeriodFilterSection />}

      <AccountFilterSection
        demoPresetSelection={demoPresetSelection}
        demoPresetActive={demoPresetActive}
      />

      {visibility.showPositionFilters && <PositionFilterSection />}
    </SidePanel>
  )
}

function PeriodFilterSection() {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { setFilters } = useDashboardFilters()
  const hasPeriodFilter = Boolean(filters.dateFrom || filters.dateTo)
  return (
    <FilterSection
      title={i18n.t('ui.filterbar.period')}
      description={i18n.t(
        'ui.filterbar.limitTimeBasedChartsAndCalculationsToASpecific',
      )}
    >
      <Inline as="div" flow="wrap" gap="compact">
        {DATE_PRESETS.map((preset) => (
          <DatePresetChip key={preset.label} preset={preset} />
        ))}
      </Inline>
      <Inline as="div" spaceBefore="default" align="center" gap="default">
        <Layout as="span" flow="control" sizing="flexible">
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
          />
        </Layout>
        <FieldSeparator />
        <Layout as="span" flow="control" sizing="flexible">
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
          />
        </Layout>
      </Inline>
      {hasPeriodFilter && (
        <Layout as="span" flow="control" spaceBefore="default">
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
          >
            {i18n.t('ui.filterbar.clearPeriod')}
          </Button>
        </Layout>
      )}
    </FilterSection>
  )
}
function AccountFilterSection({
  demoPresetSelection,
  demoPresetActive,
}: Pick<FilterPanelProps, 'demoPresetSelection' | 'demoPresetActive'>) {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { setFilters } = useDashboardFilters()
  const { accountFilterLabels, accountToType, allAccounts, allAccountTypes } =
    usePortfolioFilterOptions()
  if (allAccounts.length === 0) return null
  return (
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
        <Layout spaceBefore="default">
          <Surface variant="raisedInset">
            <Inline
              as="div"
              align="center"
              justify="between"
              gap="default"
              inset="default"
            >
              <div>
                <Text as="div" variant="captionLabel" tone="secondary">
                  {i18n.t('ui.filterbar.staticDemo')}
                </Text>
                <Layout spaceBefore="compact">
                  <Text as="div" variant="micro" tone="subtle">
                    {i18n.t(
                      'ui.filterbar.useThePrecomputedFilteredReturnSample',
                    )}
                  </Text>
                </Layout>
              </div>
              <Layout as="span" flow="control" sizing="fixed">
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
                >
                  {i18n.t('ui.filterbar.excludePrivateEquity')}
                </Button>
              </Layout>
            </Inline>
          </Surface>
        </Layout>
      )}
    </FilterSection>
  )
}
function PositionFilterSection() {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { setFilters } = useDashboardFilters()
  const { allOperationTypes } = usePortfolioFilterOptions()
  return (
    <FilterSection
      title={i18n.t('ui.filterbar.positions')}
      description={i18n.t(
        'ui.filterbar.refineTheTransactionsAndHoldingsShownInTheTable',
      )}
    >
      <Text as="div" variant="captionLabel" tone="muted">
        {i18n.t('ui.filterbar.operationType')}
      </Text>
      <Inline as="div" flow="wrap" spaceBefore="default" gap="compact">
        <Chip
          label={i18n.t('ui.filterbar.all')}
          active={filters.operationTypes.size === 0}
          onClick={() => setFilters({ ...filters, operationTypes: new Set() })}
        />
        {allOperationTypes.map((operation) => (
          <OperationTypeChip key={operation} operation={operation} />
        ))}
      </Inline>
      <Layout spaceBefore="spacious">
        <ChoiceRow variant="card">
          <Inline
            as="span"
            align="center"
            justify="between"
            gap="default"
            inset="default"
          >
            <span>
              <Text variant="captionLabel" tone="secondary">
                <Layout as="span" flow="block">
                  {i18n.t('ui.filterbar.hideClosedPositions')}
                </Layout>
              </Text>
              <Layout as="span" flow="block" spaceBefore="compact">
                <Text variant="micro" tone="subtle">
                  <Layout as="span" flow="block">
                    {i18n.t(
                      'ui.filterbar.keepTheTableFocusedOnCurrentHoldings',
                    )}
                  </Layout>
                </Text>
              </Layout>
            </span>
            <Layout as="span" flow="inline" sizing="fixed">
              <Checkbox
                size="standard"
                checked={filters.hideClosedPositions}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    hideClosedPositions: event.target.checked,
                  })
                }
              />
            </Layout>
          </Inline>
        </ChoiceRow>
      </Layout>
    </FilterSection>
  )
}

export function FilterButton({ activeCount }: { activeCount: number }) {
  const open = useAtomValue(dashboardFiltersOpenAtom)
  const { openFilters } = useDashboardFilters()

  return (
    <Layout as="span" flow="control" sizing="fixed">
      <DialogButton
        type="button"
        onClick={openFilters}
        expanded={open}
        variant="filter"
        selected={activeCount > 0}
      >
        <FilterIcon />
        <span>{i18n.t('ui.filterbar.filters')}</span>
        {activeCount > 0 && (
          <Layout as="span" flow="inline">
            <SelectionCount>
              <Layout as="span" flow="inline" inset="compact">
                {activeCount}
              </Layout>
            </SelectionCount>
          </Layout>
        )}
      </DialogButton>
    </Layout>
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
    <div className="mb-4">
      <Group label={i18n.t('ui.filterbar.activeFilters')}>
        <Inline as="div" flow="wrap" align="center" gap="default">
          {leading}
          {items.map((item) => (
            <ActiveFilterChip key={item.key} item={item} />
          ))}
          {content}
          {actions}
        </Inline>
      </Group>
    </div>
  )
}

export function ResetFiltersButton() {
  const { resetDashboardFilters } = useDashboardFilters()

  return (
    <Button type="button" onClick={resetDashboardFilters} variant="text">
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
