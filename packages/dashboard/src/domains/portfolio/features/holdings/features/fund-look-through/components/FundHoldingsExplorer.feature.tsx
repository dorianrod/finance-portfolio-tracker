import { useFundExposureViewModel } from '@/domains/portfolio/features/holdings/features/fund-look-through/services/useFundExposureViewModel'
import { useVirtualExposureList } from '@/domains/portfolio/features/holdings/features/fund-look-through/services/useVirtualExposureList'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import type { FundExposureSort } from '@/domains/portfolio/shared/helpers/mappers/buildFundExposureViewModel'
import { type FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'
import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { DATA_TABLE_STYLES } from '@/shared/ui/tableStyles'

import { GRID, VirtualExposureRow } from './FundExposureRows.view'

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
    <section className={DATA_TABLE_STYLES.panel}>
      <div className={DATA_TABLE_STYLES.toolbar}>
        <div>
          <h2 className={`${DATA_TABLE_STYLES.title} flex items-center`}>
            {i18n.t('ui.fundholdingsexplorer.allIdentifiedEconomicExposure')}
            <ScopedInfoTooltip
              text={i18n.t(
                'ui.fundholdingsexplorer.underlyingHoldingsGroupedByIssuerWithSecurityAndSource',
              )}
              scope={{ account: 'filterable', period: 'as-of' }}
            />
          </h2>
          <p className={DATA_TABLE_STYLES.description}>
            {i18n.t(
              'ui.fundholdingsexplorer.groupedByIssuerWithSecurityAndSourceFundDetail',
            )}
          </p>
        </div>
        <div className={DATA_TABLE_STYLES.actions}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={i18n.t(
              'ui.fundholdingsexplorer.searchIssuerSecurityOrFund',
            )}
            aria-label={i18n.t(
              'ui.fundholdingsexplorer.searchUnderlyingExposure',
            )}
            className="min-w-0 flex-1 rounded-lg border border-border-strong bg-canvas px-3 py-2 text-sm text-content-secondary outline-none focus:border-accent sm:w-72"
          />
          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value as FundExposureSort)
            }
            aria-label={i18n.t(
              'ui.fundholdingsexplorer.sortUnderlyingExposure',
            )}
            className="rounded-lg border border-border-strong bg-canvas px-3 py-2 text-sm text-content-secondary"
          >
            <option value="value">
              {i18n.t('ui.fundholdingsexplorer.largestFirst')}
            </option>
            <option value="name">
              {i18n.t('ui.fundholdingsexplorer.name')}
            </option>
          </select>
        </div>
      </div>
      <div>
        <div>
          <div className={`${GRID} ${DATA_TABLE_STYLES.columnHeader} py-2`}>
            <span>{i18n.t('ui.fundholdingsexplorer.issuer')}</span>
            <span className="text-right">
              {i18n.t('ui.fundholdingsexplorer.exposure')}
            </span>
            <span className="text-right">
              {i18n.t('ui.fundholdingsexplorer.portfolio')}
            </span>
            <span>{i18n.t('ui.fundholdingsexplorer.sources')}</span>
          </div>
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
          <p className="p-8 text-center text-sm text-content-subtle">
            {i18n.t('ui.fundholdingsexplorer.noExposureMatchesThisSearch')}
          </p>
        )}
      </div>
      <div className="sticky bottom-0 z-10 rounded-b-xl border-t border-border bg-surface px-4 py-2 text-xs text-content-muted">
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
          <span className="text-content-subtle">
            {' '}
            {i18n.t('ui.fundholdingsexplorer.filteredFromIssuers', {
              count: totalIssuerCount,
              formattedCount: formatNumber(totalIssuerCount),
            })}
          </span>
        )}
      </div>
    </section>
  )
}
