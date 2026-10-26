import type { FundExposureSort } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/mappers/buildFundExposureViewModel'
import { useFundExposureViewModel } from '@/domains/portfolio/features/holdings/features/fund-look-through/services/useFundExposureViewModel'
import { useVirtualExposureList } from '@/domains/portfolio/features/holdings/features/fund-look-through/services/useVirtualExposureList'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { type FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { Input, Select } from '@/shared/ui/Controls.view'
import { Grid, Inline, Layout } from '@/shared/ui/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { TablePanel } from '@/shared/ui/TablePanel.view'
import { Text } from '@/shared/ui/Text.view'
import { VirtualCanvas } from '@/shared/ui/VirtualRow.view'

import { VirtualExposureRow } from './FundExposureRows/FundExposureRows.view'

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
          <TablePanel.Title>
            <Inline as="span" align="center">
              {i18n.t('ui.fundholdingsexplorer.allIdentifiedEconomicExposure')}
              <ScopedInfoTooltip
                text={i18n.t(
                  'ui.fundholdingsexplorer.underlyingHoldingsGroupedByIssuerWithSecurityAndSource',
                )}
                scope={{ account: 'filterable', period: 'as-of' }}
              />
            </Inline>
          </TablePanel.Title>
          <TablePanel.Description>
            {i18n.t(
              'ui.fundholdingsexplorer.groupedByIssuerWithSecurityAndSourceFundDetail',
            )}
          </TablePanel.Description>
        </div>
        <TablePanel.Actions>
          <Layout as="span" flow="control" sizing="flexible">
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={i18n.t(
                'ui.fundholdingsexplorer.searchIssuerSecurityOrFund',
              )}
              label={i18n.t('ui.fundholdingsexplorer.searchUnderlyingExposure')}
              variant="canvasSearch"
            />
          </Layout>
          <Select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as FundExposureSort)
            }
            label={i18n.t('ui.fundholdingsexplorer.sortUnderlyingExposure')}
            variant="canvasSelect"
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
          <TablePanel.Header as="div">
            <Grid arrangement="labelThreeValues" inset="compact">
              <span>{i18n.t('ui.fundholdingsexplorer.issuer')}</span>
              <Text align="right">
                {i18n.t('ui.fundholdingsexplorer.exposure')}
              </Text>
              <Text align="right">
                {i18n.t('ui.fundholdingsexplorer.portfolio')}
              </Text>
              <span>{i18n.t('ui.fundholdingsexplorer.sources')}</span>
            </Grid>
          </TablePanel.Header>
          <VirtualCanvas ref={listRef} height={virtualizer.getTotalSize()}>
            {virtualRows.map((virtualRow) => (
              <VirtualExposureRow
                key={virtualRow.key}
                item={virtualRow.item}
                onToggle={toggleIssuer}
                row={virtualRow.row}
                scrollMargin={scrollMargin}
              />
            ))}
          </VirtualCanvas>
        </div>
        {displayed.length === 0 && (
          <Text as="p" variant="body" tone="subtle" align="center">
            <Layout as="span" flow="block" inset="spacious">
              {i18n.t('ui.fundholdingsexplorer.noExposureMatchesThisSearch')}
            </Layout>
          </Text>
        )}
      </div>
      <Layout>
        <Surface variant="floatingFooter" tone="muted">
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
      </Layout>
    </TablePanel>
  )
}

export type { FundExposureSort } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/mappers/buildFundExposureViewModel'
