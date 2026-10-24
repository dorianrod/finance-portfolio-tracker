import { formatManualPrice } from '@/domains/portfolio/features/data-quality/features/errors/helpers/formatters/formatManualPrice'
import type { ManualPriceOverride } from '@/domains/portfolio/shared/types/manualPriceOverride.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'

export type ManualPriceOverridesProps = {
  manualPriceOverrides: ManualPriceOverride[]
}

export function ManualPriceOverrideRow({ row }: { row: ManualPriceOverride }) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const openEnded = !row.date_to
  return (
    <tr className="border-b border-border/50 hover:bg-surface/40">
      <td className="px-3 py-2">
        <span
          className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold ${openEnded ? 'bg-warning-muted/60 text-warning' : 'bg-surface-raised text-content-muted'}`}
        >
          {openEnded ? i18n.t('ui.errorstab.openEnded') : i18n.t('ui.errorstab.bounded')}
        </span>
      </td>
      <td className="px-3 py-2 text-content-secondary">{row.name || '—'}</td>
      <td className="px-3 py-2 font-mono text-content-subtle">{row.isin || row.ticker || '—'}</td>
      <td className="px-3 py-2 font-medium text-content-secondary">
        {formatManualPrice(row, formatMoney)}
      </td>
      <td className="px-3 py-2 font-mono text-content-muted">
        {row.date_from ? formatDate(row.date_from, { style: 'isoDate' }) : '—'}
      </td>
      <td className="px-3 py-2 font-mono text-content-muted">
        {row.date_to ? formatDate(row.date_to, { style: 'isoDate' }) : '—'}
      </td>
      <td className="px-3 py-2 font-mono text-content-subtle">{row.source_file}</td>
    </tr>
  )
}

export function ManualPriceOverridesTable({ manualPriceOverrides }: ManualPriceOverridesProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-surface/60 text-left text-content-muted">
            <th className="px-3 py-2 font-medium w-24">{i18n.t('ui.errorstab.status')}</th>
            <th className="px-3 py-2 font-medium">{i18n.t('ui.errorstab.asset')}</th>
            <th className="px-3 py-2 font-medium w-28">{i18n.t('ui.errorstab.isinTicker')}</th>
            <th className="px-3 py-2 font-medium w-24">{i18n.t('ui.errorstab.forcedPrice')}</th>
            <th className="px-3 py-2 font-medium w-24">{i18n.t('ui.errorstab.from')}</th>
            <th className="px-3 py-2 font-medium w-24">{i18n.t('ui.errorstab.until')}</th>
            <th className="px-3 py-2 font-medium w-36">{i18n.t('ui.errorstab.source')}</th>
          </tr>
        </thead>
        <tbody>
          {manualPriceOverrides.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-content-subtle">
                {i18n.t('ui.errorstab.noManualPriceOverrides')}
              </td>
            </tr>
          ) : (
            manualPriceOverrides.map((row) => (
              <ManualPriceOverrideRow key={row.source_file} row={row} />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
