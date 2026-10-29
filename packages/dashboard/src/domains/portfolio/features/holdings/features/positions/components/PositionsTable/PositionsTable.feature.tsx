import {
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
  type Table,
  useReactTable,
} from '@tanstack/react-table'
import { ScopeProvider } from 'jotai-scope'
import { Fragment } from 'react'

import { FundPositionPopover } from '@/domains/portfolio/features/holdings/features/positions/components/FundPositionPopover/FundPositionPopover.feature'
import { HoverAllocationPopover } from '@/domains/portfolio/features/holdings/features/positions/components/HoverAllocationPopover/HoverAllocationPopover.view'
import { POSITION_COLUMNS } from '@/domains/portfolio/features/holdings/features/positions/components/PositionColumnDefinitions.feature'
import { HoverChart } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/HoverChart.feature'
import { HoverSavingsChart } from '@/domains/portfolio/features/holdings/features/positions/components/PositionHoverDetails/HoverSavingsChart.feature'
import { usePositionTableData } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/helpers/mappers/usePositionTableData'
import { usePositionGroupPreviews } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/services/usePositionGroupPreviews'
import { usePositionTableOverlays } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/services/usePositionTableOverlays'
import { usePositionTableState } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/services/usePositionTableState'
import type { PositionPreviewModel } from '@/domains/portfolio/features/holdings/features/positions/components/PositionsTable/types/positionPreviewModel.type'
import { PositionRowSurface } from '@/domains/portfolio/features/holdings/features/positions/components/positionTableAppearance/PositionRowSurface.view'
import { PositionBodyCell } from '@/domains/portfolio/features/holdings/features/positions/components/positionTableCells/PositionBodyCell.view'
import { PositionHeaderRow } from '@/domains/portfolio/features/holdings/features/positions/components/positionTableCells/PositionHeaderRow.view'
import { isClosedPosition } from '@/domains/portfolio/features/holdings/features/positions/helpers/businessRules/positionDisplayRules/isClosedPosition'
import type { PositionGroupTotal } from '@/domains/portfolio/features/holdings/features/positions/helpers/calculators/calculatePositionTableValues/calculatePositionTableValues.types'
import { positionPreviewAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionPreviews/positionPreviewAtom'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type {
  PositionRow,
  TableRow,
} from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { Button } from '@/shared/ui/controls/Button.view'
import { TableColumn } from '@/shared/ui/dataTable/TableColumn.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Preview } from '@/shared/ui/Preview.view'
import { Surface } from '@/shared/ui/Surface.view'
import { TablePanel } from '@/shared/ui/TablePanel.view'
import { Text } from '@/shared/ui/Text.view'

import { PositionGroupSeparator } from './PositionGroupSeparator.view'

export function PositionsTable(props: Props) {
  return (
    <ScopeProvider atoms={POSITION_PREVIEW_ATOMS}>
      <PositionsTableContent {...props} />
    </ScopeProvider>
  )
}

const POSITION_PREVIEW_ATOMS = [positionPreviewAtom]

function PositionsTableContent({
  data,
  groupByAccountType = false,
  fundStatuses = EMPTY_FUND_STATUSES,
}: Props) {
  const { expanded, setExpanded } = usePositionTableState()
  const { allocationData, groupTotals } = usePositionTableData(data)
  const { preview, dismiss, cancelHide, scheduleHide } =
    usePositionTableOverlays(data, fundStatuses, allocationData)

  // eslint-disable-next-line react-hooks/incompatible-library -- reviewed: 2026-10-27; TanStack Table v8 mutates a stable table instance; React Compiler is not enabled here, and getRowModel() is read on every render without memoizing the table's mutable API.
  const table = useReactTable<TableRow>({
    data,
    columns: POSITION_COLUMNS,
    meta: {
      positionColumns: {
        allocationData,
        fundStatuses,
        cancelHide,
        scheduleHide,
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
    let totals: PositionGroupTotal | undefined
    if (groupByAccountType && item.kind === 'position' && row.depth === 0) {
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
      open={preview !== null}
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
                      totals={item.totals}
                    />
                  ))}
                </tbody>
              </Surface>
            </Layout>
          </Surface>
        </Layout>

        <PositionTablePreviews
          preview={preview}
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
  groupByAccountType?: boolean
}

type PositionBodyRowProps = {
  cancelHide: () => void
  row: Row<TableRow>
  scheduleHide: () => void
  separatorType?: string
  totals?: PositionGroupTotal
}

function PositionBodyRow({
  cancelHide,
  row,
  scheduleHide,
  separatorType,
  totals,
}: PositionBodyRowProps) {
  const item = row.original
  const isPosition = item.kind === 'position'
  const isGroup = item.kind === 'group'
  let rowKind: 'position' | 'group' | 'detail' = 'detail'
  if (isPosition) rowKind = 'position'
  else if (isGroup) rowKind = 'group'
  let rootRow = row
  let parentRow = rootRow.getParentRow()
  while (parentRow) {
    rootRow = parentRow
    parentRow = rootRow.getParentRow()
  }
  const isClosed = isClosedPosition(rootRow.original)
  const { chartHandlers, savingsHandlers } = usePositionGroupPreviews({
    row,
    cancelHide,
    scheduleHide,
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

function PositionTableToolbar({ table }: { table: Table<TableRow> }) {
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
  preview,
  cancelHide,
  scheduleHide,
}: {
  preview: PositionPreviewModel | null
  cancelHide: () => void
  scheduleHide: () => void
}) {
  if (!preview) return null
  switch (preview.kind) {
    case 'chart':
      return (
        <HoverChart
          target={preview.target}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      )
    case 'savings':
      return (
        <HoverSavingsChart
          target={preview.target}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      )
    case 'allocation':
      return (
        <HoverAllocationPopover
          target={preview.target}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      )
    case 'underlying':
      return (
        <FundPositionPopover
          target={preview.target}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
        />
      )
  }
}
