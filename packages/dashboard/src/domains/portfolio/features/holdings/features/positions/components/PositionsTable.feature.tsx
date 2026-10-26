import {
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table'
import { Fragment } from 'react'

import { FundPositionPopover } from '@/domains/portfolio/features/holdings/features/positions/components/FundPositionPopover.feature'
import { HoverAllocationPopover } from '@/domains/portfolio/features/holdings/features/positions/components/HoverAllocationPopover.view'
import { POSITION_COLUMNS } from '@/domains/portfolio/features/holdings/features/positions/components/PositionColumnDefinitions.feature'
import { HoverChart } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/HoverChart.feature'
import { HoverSavingsChart } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/HoverSavingsChart.feature'
import { isClosedPosition } from '@/domains/portfolio/features/holdings/features/positions/helpers/businessRules/positionDisplayRules'
import { calculatePositionGroupTotals } from '@/domains/portfolio/features/holdings/features/positions/helpers/calculators/calculatePositionTableValues'
import { getGainTone } from '@/domains/portfolio/features/holdings/features/positions/helpers/presenters/getGainTone'
import { usePositionGroupPreviews } from '@/domains/portfolio/features/holdings/features/positions/services/usePositionGroupPreviews'
import { usePositionTableData } from '@/domains/portfolio/features/holdings/features/positions/services/usePositionTableData'
import { usePositionTableOverlays } from '@/domains/portfolio/features/holdings/features/positions/services/usePositionTableOverlays'
import { usePositionTableState } from '@/domains/portfolio/features/holdings/features/positions/services/usePositionTableState'
import type { AllocationHoverTarget } from '@/domains/portfolio/features/holdings/features/positions/types/allocationHoverTarget.type'
import type { ChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/chartTarget.type'
import type { FundPositionPopoverTarget } from '@/domains/portfolio/features/holdings/features/positions/types/fundPositionPopoverTarget.type'
import type { SavingsChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/savingsChartTarget.type'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHolding.type'
import type {
  PositionRow,
  TableRow,
} from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { Button } from '@/shared/ui/Controls.view'
import { DataCell, TableColumn } from '@/shared/ui/DataTable.view'
import { Inline, Layout } from '@/shared/ui/Layout.view'
import { Preview } from '@/shared/ui/Preview.view'
import { Surface } from '@/shared/ui/Surface.view'
import { TablePanel } from '@/shared/ui/TablePanel.view'
import { Text } from '@/shared/ui/Text.view'

import { PositionRowSurface } from './PositionTableAppearance.view'
import { PositionBodyCell, PositionHeaderRow } from './PositionTableCells.view'

export function PositionsTable({
  data,
  grouping = 'flat',
  fundStatuses = EMPTY_FUND_STATUSES,
}: Props) {
  const { expanded, setExpanded } = usePositionTableState()
  const {
    allocationHover,
    dismiss,
    cancelHide,
    chart,
    savingsChart,
    scheduleHide,
    setAllocationHover,
    setChart,
    setSavingsChart,
    setUnderlyingPopover,
    underlyingPopover,
  } = usePositionTableOverlays()
  const { allocationData, groupTotals } = usePositionTableData(data)

  // @tanstack/react-table returns fresh row/column helper functions on every
  // call, which the React Compiler can never safely memoize — not fixable here.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TableRow>({
    data,
    columns: POSITION_COLUMNS,
    meta: {
      positionColumns: {
        allocationData,
        fundStatuses,
        cancelHide,
        scheduleHide,
        setAllocationHover,
        setChart,
        setSavingsChart,
        setUnderlyingPopover,
      },
    },
    getSubRows: (row) => {
      if (row.kind === 'position') return row.subRows
      if (row.kind === 'group') return row.subRows
      return undefined
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: { expanded },
    onExpandedChange: setExpanded,
  })
  let previousAccountType: string | undefined
  const bodyRows = table.getRowModel().rows.map((row) => {
    const item = row.original
    let separatorType: string | undefined
    let totals: PositionGroupTotals | undefined
    if (
      grouping === 'account-type' &&
      item.kind === 'position' &&
      row.depth === 0
    ) {
      const currentType = item.account_type ?? ''
      if (currentType !== previousAccountType) {
        previousAccountType = currentType
        separatorType = currentType
        totals = groupTotals.get(currentType)
      }
    }
    return { row, separatorType, totals }
  })

  return (
    <Preview
      onKeepOpen={cancelHide}
      open={Boolean(
        chart || savingsChart || allocationHover || underlyingPopover,
      )}
      onOpenChange={(open) => {
        if (!open) dismiss()
      }}
    >
      <TablePanel>
        <PositionTableToolbar table={table} />
        <Layout overflow="auto">
          <Surface variant="tableBottom">
            <Layout>
              <Surface variant="bodyFixedTable" as="table" align="left">
                <colgroup>
                  <TableColumn kind="expander" />
                  <TableColumn kind="label" />
                  <TableColumn kind="value" />
                  <TableColumn kind="compact" />
                  <TableColumn kind="value" />
                  <TableColumn kind="value" />
                  <TableColumn kind="value" />
                  <TableColumn kind="value" />
                  <TableColumn kind="value" />
                  <TableColumn kind="value" />
                </colgroup>
                <TablePanel.Header>
                  {table.getHeaderGroups().map((group) => (
                    <PositionHeaderRow key={group.id} group={group} />
                  ))}
                </TablePanel.Header>
                <tbody>
                  {bodyRows.map((item) => (
                    <PositionBodyRow
                      key={item.row.id}
                      cancelHide={cancelHide}
                      row={item.row}
                      scheduleHide={scheduleHide}
                      separatorType={item.separatorType}
                      setAllocationHover={setAllocationHover}
                      setChart={setChart}
                      setSavingsChart={setSavingsChart}
                      setUnderlyingPopover={setUnderlyingPopover}
                      totals={item.totals}
                    />
                  ))}
                </tbody>
              </Surface>
            </Layout>
          </Surface>
        </Layout>

        <PositionTablePreviews
          chart={chart}
          savingsChart={savingsChart}
          allocationHover={allocationHover}
          underlyingPopover={underlyingPopover}
          cancelHide={cancelHide}
          scheduleHide={scheduleHide}
        />
      </TablePanel>
    </Preview>
  )
}

const EMPTY_FUND_STATUSES: FundHoldingStatus[] = []

type Props = {
  data: PositionRow[]
  fundStatuses?: FundHoldingStatus[]
  grouping?: 'flat' | 'account-type'
}

type PositionGroupTotals =
  ReturnType<typeof calculatePositionGroupTotals> extends Map<
    string,
    infer Totals
  >
    ? Totals
    : never

type PositionBodyRowProps = {
  cancelHide: () => void
  row: Row<TableRow>
  scheduleHide: () => void
  separatorType?: string
  setAllocationHover: React.Dispatch<
    React.SetStateAction<AllocationHoverTarget | null>
  >
  setChart: React.Dispatch<React.SetStateAction<ChartTarget | null>>
  setSavingsChart: React.Dispatch<
    React.SetStateAction<SavingsChartTarget | null>
  >
  setUnderlyingPopover: React.Dispatch<
    React.SetStateAction<FundPositionPopoverTarget | null>
  >
  totals?: PositionGroupTotals
}

function PositionBodyRow({
  cancelHide,
  row,
  scheduleHide,
  separatorType,
  setAllocationHover,
  setChart,
  setSavingsChart,
  setUnderlyingPopover,
  totals,
}: PositionBodyRowProps) {
  const item = row.original
  const isPosition = item.kind === 'position'
  const isGroup = item.kind === 'group'
  let rowKind: 'position' | 'group' | 'detail' = 'detail'
  if (isPosition) rowKind = 'position'
  else if (isGroup) rowKind = 'group'
  let rootRow = row
  while (rootRow.getParentRow()) rootRow = rootRow.getParentRow()!
  const isClosed = isClosedPosition(rootRow.original)
  const { chartHandlers, savingsHandlers } = usePositionGroupPreviews({
    row,
    cancelHide,
    scheduleHide,
    setChart,
    setSavingsChart,
    setAllocationHover,
    setUnderlyingPopover,
  })

  return (
    <Fragment>
      {separatorType !== undefined && (
        <PositionGroupSeparator separatorType={separatorType} totals={totals} />
      )}
      <PositionRowSurface
        kind={rowKind}
        closed={isClosed}
        onClick={
          row.getCanExpand() ? row.getToggleExpandedHandler() : undefined
        }
      >
        {row.getVisibleCells().map((cell) => (
          <PositionBodyCell
            key={cell.id}
            cell={cell}
            chartHandlers={chartHandlers}
            savingsHandlers={savingsHandlers}
          />
        ))}
      </PositionRowSurface>
    </Fragment>
  )
}

function PositionGroupSeparator({
  separatorType,
  totals,
}: {
  separatorType: string
  totals?: PositionGroupTotals
}) {
  const formatMoney = useFormatMoney()
  return (
    <tr>
      <DataCell variant="group" />
      <DataCell variant="groupLabel">
        {separatorType || i18n.t('ui.positionstable.other')}
      </DataCell>
      <DataCell variant="groupValue">
        {totals && totals.value > 0 ? formatMoney(totals.value) : ''}
      </DataCell>
      <DataCell variant="group" />
      <DataCell
        variant="group"
        tone={totals ? getGainTone(totals.unrealized) : undefined}
      >
        {formatMoney(totals?.unrealized, {
          fallback: '',
          zeroAsFallback: true,
        })}
      </DataCell>
      <DataCell
        variant="group"
        tone={totals ? getGainTone(totals.realized) : undefined}
      >
        {formatMoney(totals?.realized, {
          fallback: '',
          zeroAsFallback: true,
        })}
      </DataCell>
      <DataCell
        variant="group"
        tone={totals ? getGainTone(totals.totalRealized) : undefined}
      >
        {formatMoney(totals?.totalRealized, {
          fallback: '',
          zeroAsFallback: true,
        })}
      </DataCell>
      <DataCell variant="group" tone={'decorative'}>
        {formatMoney(totals?.dividends, {
          fallback: '',
          zeroAsFallback: true,
        })}
      </DataCell>
      <DataCell variant="group" />
      <DataCell variant="group" />
    </tr>
  )
}

function PositionTableToolbar({
  table,
}: {
  table: import('@tanstack/react-table').Table<TableRow>
}) {
  return (
    <TablePanel.Toolbar>
      <div>
        <TablePanel.Title>
          <Inline as="span" align="center">
            {i18n.t('ui.positionstable.allPortfolioPositions')}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.positionstable.positionsAreValuedAtPeriodEndExpandedTransactionAnd',
              )}
              scope={{ account: 'filterable', period: 'as-of' }}
            />
          </Inline>
        </TablePanel.Title>
        <TablePanel.Description>
          {i18n.t(
            'ui.positionstable.expandEachPositionToReviewItsTransactionsAndIncome',
          )}
        </TablePanel.Description>
        <Layout spaceBefore="compact">
          <Text as="p" variant="tiny" tone="subtle">
            {i18n.t(
              'ui.positionstable.transactionAndIncomeAmountsUseTheSelectedPeriod',
            )}
          </Text>
        </Layout>
      </div>
      <TablePanel.Actions>
        <Layout as="span" flow="control" sizing="flexible">
          <Button
            type="button"
            onClick={() => table.toggleAllRowsExpanded(true)}
            variant="tableExpand"
          >
            {i18n.t('ui.positionstable.expandAll')}
          </Button>
        </Layout>
        <Layout as="span" flow="control" sizing="flexible">
          <Button
            type="button"
            onClick={() => table.toggleAllRowsExpanded(false)}
            variant="tableExpand"
          >
            {i18n.t('ui.positionstable.collapseAll')}
          </Button>
        </Layout>
      </TablePanel.Actions>
    </TablePanel.Toolbar>
  )
}

function PositionTablePreviews({
  chart,
  savingsChart,
  allocationHover,
  underlyingPopover,
  cancelHide,
  scheduleHide,
}: Pick<
  ReturnType<typeof usePositionTableOverlays>,
  | 'chart'
  | 'savingsChart'
  | 'allocationHover'
  | 'underlyingPopover'
  | 'cancelHide'
  | 'scheduleHide'
>) {
  return (
    <>
      {chart && (
        <HoverChart
          target={chart}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      )}

      {savingsChart && (
        <HoverSavingsChart
          target={savingsChart}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      )}

      {allocationHover && (
        <HoverAllocationPopover
          target={allocationHover}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      )}

      {underlyingPopover && (
        <FundPositionPopover
          target={underlyingPopover}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      )}
    </>
  )
}
