import { useAtomValue } from 'jotai'

import { AccountTree } from '@/domains/portfolio/features/scope-selection/components/accountTreeSelect/AccountTree.feature'
import { Chip } from '@/domains/portfolio/features/scope-selection/components/Chip.view'
import { FilterSection } from '@/domains/portfolio/features/scope-selection/components/FilterSection.view'
import type { FilterVisibility } from '@/domains/portfolio/features/scope-selection/helpers/filters/portfolioFilters.types'
import { presetDateFrom } from '@/domains/portfolio/features/scope-selection/helpers/filters/presetDateFrom'
import { toggle } from '@/domains/portfolio/features/scope-selection/helpers/filters/toggle'
import { usePortfolioFilterOptions } from '@/domains/portfolio/features/scope-selection/helpers/filters/usePortfolioFilterOptions'
import { useDashboardFilters } from '@/domains/portfolio/features/scope-selection/services/actions/useDashboardFilters'
import { useDashboardFilterPanel } from '@/domains/portfolio/shared/services/actions/useDashboardFilterPanel'
import { dashboardFiltersAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFiltersAtom'
import { dashboardFiltersOpenAtom } from '@/domains/portfolio/shared/stores/dashboardFilters/dashboardFiltersOpenAtom'
import type { OperationType } from '@/domains/portfolio/shared/types/operationType.type'
import i18n from '@/i18n/i18n'
import { toDateInputValue } from '@/shared/helpers/mappers/toDateInputValue'
import { DATE_FILTER_SCHEMA } from '@/shared/schemas/calendarDate/dateFilterSchema'
import { Checkbox } from '@/shared/ui/Checkbox.view'
import { Button } from '@/shared/ui/controls/Button.view'
import { Input } from '@/shared/ui/controls/Input.view'
import { ChoiceRow } from '@/shared/ui/formElements/ChoiceRow.view'
import { FieldSeparator } from '@/shared/ui/formElements/FieldSeparator.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SidePanel } from '@/shared/ui/SidePanel.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function FilterPanel({
  onReset,
  visibility,
  demoPresetSelection,
  demoPresetActive = false,
}: FilterPanelProps & { onReset: () => void }) {
  const open = useAtomValue(dashboardFiltersOpenAtom)
  const { closeFilters } = useDashboardFilterPanel()

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
          <Button type="button" onClick={onReset} variant="quiet">
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

type FilterPanelProps = {
  visibility: FilterVisibility
  // The static demo endpoint may not provide a precomputed account preset.
  demoPresetSelection: Set<string> | null
  demoPresetActive?: boolean
}

const OP_LABELS: Record<OperationType, string> = {
  get BUY() {
    return i18n.t('ui.filterbar.buy')
  },
  get SELL() {
    return i18n.t('ui.filterbar.sell')
  },
  get DIVIDEND() {
    return i18n.t('ui.filterbar.dividend')
  },
  get INTEREST() {
    return i18n.t('ui.filterbar.interest')
  },
  get DEPOSIT() {
    return i18n.t('ui.filterbar.deposit')
  },
  get WITHDRAWAL() {
    return i18n.t('ui.filterbar.withdrawal')
  },
}

const DATE_PRESETS = [
  {
    get label() {
      return i18n.t('ui.filterbar.thisMonth')
    },
    months: 0,
  },
  {
    get label() {
      return i18n.t('ui.filterbar.3Months')
    },
    months: 3,
  },
  {
    get label() {
      return i18n.t('ui.filterbar.6Months')
    },
    months: 6,
  },
  {
    get label() {
      return i18n.t('ui.filterbar.1Year')
    },
    months: 12,
  },
] as const

function DatePresetChip({ preset }: { preset: (typeof DATE_PRESETS)[number] }) {
  const filters = useAtomValue(dashboardFiltersAtom)
  const { setFilters } = useDashboardFilters()
  const dateFrom = presetDateFrom(preset.months)
  function applyPreset() {
    setFilters((current) => ({
      ...current,
      dateFrom:
        current.dateFrom?.getTime() === dateFrom.getTime() && !current.dateTo
          ? undefined
          : dateFrom,
      dateTo: undefined,
    }))
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
        setFilters((current) => ({
          ...current,
          operationTypes: toggle(current.operationTypes, operation),
        }))
      }
    />
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
              setFilters((current) => ({
                ...current,
                dateFrom: DATE_FILTER_SCHEMA.validateSync(event.target.value),
              }))
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
              setFilters((current) => ({
                ...current,
                dateTo: DATE_FILTER_SCHEMA.validateSync(event.target.value),
              }))
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
              setFilters((current) => ({
                ...current,
                dateFrom: undefined,
                dateTo: undefined,
              }))
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
          setFilters((current) => ({
            ...current,
            accounts,
            accountTypes: new Set(),
          }))
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
                    setFilters((current) => ({
                      ...current,
                      accounts: demoPresetSelection,
                      accountTypes: new Set(),
                    }))
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
          onClick={() =>
            setFilters((current) => ({ ...current, operationTypes: new Set() }))
          }
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
                  setFilters((current) => ({
                    ...current,
                    hideClosedPositions: event.target.checked,
                  }))
                }
              />
            </Layout>
          </Inline>
        </ChoiceRow>
      </Layout>
    </FilterSection>
  )
}
