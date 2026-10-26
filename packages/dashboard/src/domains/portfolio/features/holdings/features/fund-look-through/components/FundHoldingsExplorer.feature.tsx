import { useFundExposureViewModel } from '@/domains/portfolio/features/holdings/features/fund-look-through/services/useFundExposureViewModel'
import { useVirtualExposureList } from '@/domains/portfolio/features/holdings/features/fund-look-through/services/useVirtualExposureList'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { FundExposureSort } from '@/domains/portfolio/shared/helpers/mappers/buildFundExposureViewModel'
import { type FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { Input, Select } from '@/shared/ui/Controls.view'
import { Surface } from '@/shared/ui/Surface.view'
import { TablePanel } from '@/shared/ui/TablePanel.view'
import { Text } from '@/shared/ui/Text.view'

import {
  GRID,
  VirtualExposureRow,
} from './FundExposureRows/FundExposureRows.view'

export type { FundExposureSort } from '@/domains/portfolio/shared/helpers/mappers/buildFundExposureViewModel'

export function FundHoldingsExplorer({
  positions,
  holdings,
}: {
  positions: PositionRow[]
  holdings: FundHolding[]
}) {
  const formatNumber = useFormatNumber()
  const {
    displayed,
    query,
    rows,
    securityCount,
    setQuery,
    setSort,
    sort,
    toggleIssuer,
    totalIssuerCount,
  } = useFundExposureViewModel(positions, holdings)
  const { listRef, scrollMargin, virtualizer, virtualRows } =
    useVirtualExposureList(rows)

  return (
    <TablePanel>
      <TablePanel.Toolbar>
        <div>
          <TablePanel.Title className="flex items-center">
            {i18n.t('ui.fundholdingsexplorer.allIdentifiedEconomicExposure')}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.fundholdingsexplorer.underlyingHoldingsGroupedByIssuerWithSecurityAndSource',
              )}
              scope={{ account: 'filterable', period: 'as-of' }}
            />
          </TablePanel.Title>
          <TablePanel.Description>
            {i18n.t(
              'ui.fundholdingsexplorer.groupedByIssuerWithSecurityAndSourceFundDetail',
            )}
          </TablePanel.Description>
        </div>
        <TablePanel.Actions>
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={i18n.t(
              'ui.fundholdingsexplorer.searchIssuerSecurityOrFund',
            )}
            label={i18n.t('ui.fundholdingsexplorer.searchUnderlyingExposure')}
            variant="canvasSearch"
            className="min-w-0 flex-1 px-3 py-2 sm:w-72"
          />
          <Select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as FundExposureSort)
            }
            label={i18n.t('ui.fundholdingsexplorer.sortUnderlyingExposure')}
            variant="canvasSelect"
            className="px-3 py-2"
          >
            <option value="value">
              {i18n.t('ui.fundholdingsexplorer.largestFirst')}
            </option>
            <option value="name">
              {i18n.t('ui.fundholdingsexplorer.name')}
            </option>
          </Select>
        </TablePanel.Actions>
      </TablePanel.Toolbar>
      <div>
        <div>
          <TablePanel.Header as="div" className={`${GRID} py-2`}>
            <span>{i18n.t('ui.fundholdingsexplorer.issuer')}</span>
            <Text align="right">
              {i18n.t('ui.fundholdingsexplorer.exposure')}
            </Text>
            <Text align="right">
              {i18n.t('ui.fundholdingsexplorer.portfolio')}
            </Text>
            <span>{i18n.t('ui.fundholdingsexplorer.sources')}</span>
          </TablePanel.Header>
          <div
            ref={listRef}
            className="relative"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualRows.map((virtualRow) => (
              <VirtualExposureRow
                key={virtualRow.key}
                item={virtualRow.item}
                onToggle={toggleIssuer}
                row={virtualRow.row}
                scrollMargin={scrollMargin}
              />
            ))}
          </div>
        </div>
        {displayed.length === 0 && (
          <Text
            as="p"
            variant="body"
            tone="subtle"
            align="center"
            className="p-8"
          >
            {i18n.t('ui.fundholdingsexplorer.noExposureMatchesThisSearch')}
          </Text>
        )}
      </div>
      <Surface
        variant="floatingFooter"
        tone="muted"
        className="sticky bottom-0 z-10 px-4 py-2"
      >
        {i18n.t('ui.fundholdingsexplorer.issuerCount', {
          count: displayed.length,
          formattedCount: formatNumber(displayed.length),
        })}
        {' · '}
        {i18n.t('ui.fundholdingsexplorer.securityCount', {
          count: securityCount,
          formattedCount: formatNumber(securityCount),
        })}
        {displayed.length !== totalIssuerCount && (
          <Text tone="subtle">
            {' '}
            {i18n.t('ui.fundholdingsexplorer.filteredFromIssuers', {
              count: totalIssuerCount,
              formattedCount: formatNumber(totalIssuerCount),
            })}
          </Text>
        )}
      </Surface>
    </TablePanel>
  )
}
