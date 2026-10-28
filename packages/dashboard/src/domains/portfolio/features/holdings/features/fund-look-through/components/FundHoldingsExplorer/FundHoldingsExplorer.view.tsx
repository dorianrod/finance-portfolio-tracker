import type { ReactNode } from 'react'

import { VirtualExposureRow } from '@/domains/portfolio/features/holdings/features/fund-look-through/components/FundExposureRows/fundExposureRows/VirtualExposureRow.view'
import type { useFundExposureViewModel } from '@/domains/portfolio/features/holdings/features/fund-look-through/components/FundHoldingsExplorer/services/useFundExposureViewModel'
import type { useVirtualExposureList } from '@/domains/portfolio/features/holdings/features/fund-look-through/components/FundHoldingsExplorer/services/useVirtualExposureList'
import type { FundExposureSort } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/mappers/buildFundExposureViewModel'
import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { Input } from '@/shared/ui/controls/Input.view'
import { Select } from '@/shared/ui/controls/Select.view'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { TablePanel } from '@/shared/ui/TablePanel.view'
import { Text } from '@/shared/ui/Text.view'
import { VirtualCanvas } from '@/shared/ui/virtualRow/VirtualCanvas.view'

export function FundHoldingsExplorerView({
  model,
  list,
  children,
}: {
  model: ReturnType<typeof useFundExposureViewModel>
  list: ReturnType<typeof useVirtualExposureList>
  children: ReactNode
}) {
  const formatNumber = useFormatNumber()
  const {
    displayed,
    query,
    securityCount,
    setQuery,
    setSort,
    sort,
    toggleIssuer,
    totalIssuerCount,
  } = model
  const { listRef, scrollMargin, virtualizer, virtualRows } = list
  return (
    <TablePanel>
      <TablePanel.Toolbar>
        <div>
          <TablePanel.Title>
            <Inline as="span" align="center">
              {i18n.t('ui.fundholdingsexplorer.allIdentifiedEconomicExposure')}
              {children}
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
