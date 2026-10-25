import type { PerformanceContribution } from '@/domains/portfolio/features/performance/helpers/calculators/computePerformanceContributions'
import { useFormatAssetLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAssetLabel'
import type { AssetIrrItem } from '@/domains/portfolio/shared/types/assetIrr.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/theme/semanticColors'

import { getIrrBarWidth } from './helpers/presenters/getIrrBarWidth'

export function ContributionListItem({
  item,
  positive,
}: {
  item: PerformanceContribution
  positive: boolean
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const tone = positive
    ? SEMANTIC_TEXT_CLASSES.performancePositive
    : SEMANTIC_TEXT_CLASSES.performanceNegative
  return (
    <li>
      <div className="flex items-start justify-between gap-4 text-sm">
        <div className="min-w-0">
          <div
            className="truncate font-medium text-content-secondary"
            title={item.name}
          >
            {item.label}
          </div>
          <div
            className="truncate text-[11px] text-content-subtle"
            title={item.accounts.join(', ')}
          >
            {item.accounts.join(', ')}
          </div>
        </div>
        <div className="shrink-0 text-right tabular-nums">
          <div className={`font-semibold ${tone}`}>
            {formatMoney(item.amount, { style: 'full' })}
          </div>
          <div className="text-[11px] text-content-subtle">
            {formatPercentage(item.share)}
          </div>
        </div>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-raised">
        <div
          className={`h-full rounded-full ${positive ? 'bg-positive' : 'bg-danger'}`}
          style={{ width: `${Math.min(item.share, 100)}%` }}
        />
      </div>
    </li>
  )
}

export function IrrListItem({
  item,
  positive,
  strongestIrr,
}: {
  item: AssetIrrItem
  positive: boolean
  strongestIrr: number
}) {
  const formatAssetLabel = useFormatAssetLabel()
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  const tone = positive
    ? SEMANTIC_TEXT_CLASSES.performancePositive
    : SEMANTIC_TEXT_CLASSES.performanceNegative
  return (
    <li>
      <div className="flex items-start justify-between gap-4 text-sm">
        <div className="min-w-0">
          <div
            className="truncate font-medium text-content-secondary"
            title={item.name}
          >
            {formatAssetLabel(item, item.label)}
          </div>
          <div
            className="truncate text-[11px] text-content-subtle"
            title={item.accounts.join(', ')}
          >
            {item.account_types.join(', ') || item.accounts.join(', ')}
          </div>
        </div>
        <div className="shrink-0 text-right tabular-nums">
          <div className={`font-semibold ${tone}`}>
            {formatPercentage(item.irr, { decimals: 2, signed: true })}
          </div>
          <div className="text-[11px] text-content-subtle">
            {i18n.t('ui.performancecontributioncard.valueWithValues', {
              amount: formatMoney(item.value, { style: 'full' }),
            })}
          </div>
        </div>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-raised">
        <div
          className={`h-full rounded-full ${positive ? 'bg-positive' : 'bg-danger'}`}
          style={{
            width: getIrrBarWidth(item.irr, strongestIrr),
          }}
        />
      </div>
    </li>
  )
}

export function IrrList({
  title,
  items,
  positive,
}: {
  title: string
  items: AssetIrrItem[]
  positive: boolean
}) {
  const strongestIrr = Math.max(0, ...items.map((item) => Math.abs(item.irr)))

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-content-subtle">
          {title}
        </h3>
        <span className="text-[11px] text-content-subtle">
          {i18n.t('ui.performancecontributioncard.annualizedIrr')}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-content-subtle">
          {positive
            ? i18n.t('ui.performancecontributioncard.noPositiveIrr')
            : i18n.t('ui.performancecontributioncard.noNegativeIrr')}
        </p>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <IrrListItem
              key={item.key}
              item={item}
              positive={positive}
              strongestIrr={strongestIrr}
            />
          ))}
        </ol>
      )}
    </section>
  )
}
