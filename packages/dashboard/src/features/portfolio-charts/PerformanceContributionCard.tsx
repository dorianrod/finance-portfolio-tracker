import { useState } from 'react'
import type { IrrStatus } from '@/types/history'
import { InfoTooltip } from '@/features/kpis/InfoTooltip'
import { fmtFull, fmtPct } from '@/shared/format/money'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import { assetDisplayLabel } from '@/shared/format/assetLabel'
import type { AssetIrrItem, AssetIrrSummary } from '@/hooks/useAssetIrr'
import type {
  ContributionHorizon,
  PerformanceContribution,
  PerformanceContributionSummary,
} from './performanceContribution.logic'

interface Props {
  assetIrr: AssetIrrSummary
  assetIrrStatus: IrrStatus
  sinceTracking: PerformanceContributionSummary
  trailingThreeYears: PerformanceContributionSummary
  sinceTrackingIrr: number | null
  trailingThreeYearIrr: number | null
  irrStatus: IrrStatus
}

type PerformanceView = 'contribution' | 'irr'

function formatDateRange(summary: { startDate: string | null; endDate: string | null }): string {
  if (!summary.startDate || !summary.endDate) return ''
  const format = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
  return `${format(summary.startDate)} – ${format(summary.endDate)}`
}

function formatAsOfDate(date: string | undefined): string {
  if (!date) return 'Not available'
  return new Date(`${date.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function formatExactDateRange(summary: { startDate: string | null; endDate: string | null }): string {
  if (!summary.startDate || !summary.endDate) return 'Not available'
  return `${formatAsOfDate(summary.startDate)} – ${formatAsOfDate(summary.endDate)}`
}

function irrLabel(value: number | null, status: IrrStatus): string {
  if (status === 'loading') return 'Calculating…'
  if (status === 'error') return 'Unavailable'
  return value === null ? 'Not available' : fmtPct(value, 2)
}

function MetricLabel({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="flex items-center text-[11px] uppercase tracking-wider text-gray-600">
      <span>{label}</span>
      <InfoTooltip text={tooltip} />
    </div>
  )
}

function ContributionList({
  title,
  items,
  positive,
}: {
  title: string
  items: PerformanceContribution[]
  positive: boolean
}) {
  const tone = positive ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
        <span className="text-[11px] text-gray-600">Share of {positive ? 'gains' : 'losses'}</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-800 px-3 py-6 text-center text-xs text-gray-600">
          No {positive ? 'positive' : 'negative'} contribution
        </p>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <li key={item.key}>
              <div className="flex items-start justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium text-gray-300" title={item.name}>{item.label}</div>
                  <div className="truncate text-[11px] text-gray-600" title={item.accounts.join(', ')}>
                    {item.accounts.join(', ')}
                  </div>
                </div>
                <div className="shrink-0 text-right tabular-nums">
                  <div className={`font-semibold ${tone}`}>{fmtFull(item.amount)}</div>
                  <div className="text-[11px] text-gray-500">{item.share.toFixed(1)}%</div>
                </div>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-800">
                <div
                  className={`h-full rounded-full ${positive ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(item.share, 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function IrrList({
  title,
  items,
  positive,
}: {
  title: string
  items: AssetIrrItem[]
  positive: boolean
}) {
  const tone = positive ? SEMANTIC_TEXT_CLASSES.performancePositive : SEMANTIC_TEXT_CLASSES.performanceNegative
  const strongestIrr = Math.max(0, ...items.map((item) => Math.abs(item.irr)))

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
        <span className="text-[11px] text-gray-600">Annualized IRR</span>
      </div>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-800 px-3 py-6 text-center text-xs text-gray-600">
          No {positive ? 'positive' : 'negative'} IRR
        </p>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <li key={item.key}>
              <div className="flex items-start justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-medium text-gray-300" title={item.name}>{assetDisplayLabel(item, item.label)}</div>
                  <div className="truncate text-[11px] text-gray-600" title={item.accounts.join(', ')}>
                    {item.account_types.join(', ') || item.accounts.join(', ')}
                  </div>
                </div>
                <div className="shrink-0 text-right tabular-nums">
                  <div className={`font-semibold ${tone}`}>{fmtPct(item.irr, 2)}</div>
                  <div className="text-[11px] text-gray-500">Value {fmtFull(item.value)}</div>
                </div>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-gray-800">
                <div
                  className={`h-full rounded-full ${positive ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${strongestIrr > 0 ? Math.abs(item.irr) / strongestIrr * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export function AssetIrrView({ summary, status }: { summary: AssetIrrSummary; status: IrrStatus }) {
  if (status === 'loading') {
    return <div className="mt-5 rounded-lg border border-dashed border-gray-800 py-10 text-center text-sm text-gray-600">Calculating asset IRR…</div>
  }
  if (status === 'error' || !summary.available) {
    return <div className="mt-5 rounded-lg border border-dashed border-gray-800 py-10 text-center text-sm text-gray-600">Asset IRR is not available for this selection.</div>
  }

  const measured = summary.assets.filter((item) => Math.abs(item.irr) >= 0.005)
  const topReturns = measured
    .filter((item) => item.irr > 0)
    .sort((left, right) => right.irr - left.irr)
    .slice(0, 5)
  const underperformers = measured
    .filter((item) => item.irr < 0)
    .sort((left, right) => left.irr - right.irr)
    .slice(0, 5)

  return (
    <>
      <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-800 bg-gray-950/40 p-3 sm:grid-cols-3">
        <div>
          <MetricLabel
            label="IRR method"
            tooltip="Money-weighted annualized return. Opening value, purchases and contributions are outflows; sales, distributions and ending value are inflows. The timing of every flow is included."
          />
          <div className="mt-1 text-sm font-semibold text-teal-400">Money-weighted</div>
        </div>
        <div>
          <MetricLabel
            label="Assets measured"
            tooltip="Number of assets with enough positive and negative cash flows to calculate an IRR. Zero IRRs are omitted from the rankings."
          />
          <div className="mt-1 text-lg font-semibold tabular-nums text-gray-300">{measured.length}</div>
        </div>
        <div>
          <MetricLabel
            label="Period"
            tooltip="Exact opening and ending snapshots used for asset IRR. The global date filters set the requested range; the closest available snapshots are used."
          />
          <div className="mt-1 text-sm font-medium text-gray-400">{formatExactDateRange({ startDate: summary.start_date, endDate: summary.end_date })}</div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IrrList title="Top IRRs" items={topReturns} positive />
        <IrrList title="Lowest IRRs" items={underperformers} positive={false} />
      </div>
    </>
  )
}

export function PerformanceContributionCard({
  assetIrr,
  assetIrrStatus,
  sinceTracking,
  trailingThreeYears,
  sinceTrackingIrr,
  trailingThreeYearIrr,
  irrStatus,
}: Props) {
  const [view, setView] = useState<PerformanceView>('contribution')
  const [horizon, setHorizon] = useState<ContributionHorizon>('since-tracking')
  const threeYearUnavailable = !trailingThreeYears.available || trailingThreeYearIrr === null
  const activeHorizon = horizon === 'trailing-3y' && threeYearUnavailable ? 'since-tracking' : horizon
  const summary = activeHorizon === 'since-tracking' ? sinceTracking : trailingThreeYears
  const irr = activeHorizon === 'since-tracking' ? sinceTrackingIrr : trailingThreeYearIrr
  const netTone = summary.netContribution >= 0
    ? SEMANTIC_TEXT_CLASSES.performancePositive
    : SEMANTIC_TEXT_CLASSES.performanceNegative

  const description = view === 'contribution'
    ? 'Main assets creating or reducing portfolio value.'
    : 'Annualized money-weighted return by asset over the selected period.'

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center">
            <h2 className="text-sm font-medium text-gray-400">Performance by asset</h2>
            <InfoTooltip text="IRR % is the annualized money-weighted return for each asset. It neutralizes purchases, sales, deposits and withdrawals by accounting for their amount and timing. Contribution € shows the value created or lost in euros and is not a mathematical breakdown of IRR." />
          </div>
          <p className="mt-1 text-xs text-gray-600">{description}</p>
        </div>
        <div className="inline-flex self-start rounded-lg border border-gray-700 bg-gray-950 p-0.5" aria-label="Performance metric">
          <button
            type="button"
            onClick={() => setView('contribution')}
            aria-pressed={view === 'contribution'}
            className={`rounded-md px-2.5 py-1 text-xs transition-colors ${view === 'contribution' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Contribution €
          </button>
          <button
            type="button"
            onClick={() => setView('irr')}
            aria-pressed={view === 'irr'}
            className={`rounded-md px-2.5 py-1 text-xs transition-colors ${view === 'irr' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            IRR %
          </button>
        </div>
      </div>

      {view === 'irr' ? (
        <AssetIrrView summary={assetIrr} status={assetIrrStatus} />
      ) : !summary.available ? (
        <div className="mt-5 rounded-lg border border-dashed border-gray-800 py-10 text-center text-sm text-gray-600">
          Contribution history is not available for this selection.
        </div>
      ) : (
        <>
          <div className="mt-4 flex justify-end">
            <div className="inline-flex rounded-lg border border-gray-800 bg-gray-950/40 p-0.5" aria-label="Contribution horizon">
              <button
                type="button"
                onClick={() => setHorizon('since-tracking')}
                aria-pressed={activeHorizon === 'since-tracking'}
                className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${activeHorizon === 'since-tracking' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Since tracking
              </button>
              <button
                type="button"
                onClick={() => setHorizon('trailing-3y')}
                disabled={threeYearUnavailable}
                aria-pressed={activeHorizon === 'trailing-3y'}
                title={threeYearUnavailable ? 'Three years of history are not yet available' : undefined}
                className={`rounded-md px-2.5 py-1 text-[11px] transition-colors ${activeHorizon === 'trailing-3y' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'} disabled:cursor-not-allowed disabled:text-gray-700`}
              >
                Trailing 3 years
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-800 bg-gray-950/40 p-3 sm:grid-cols-3">
            <div>
              <MetricLabel
                label="IRR context"
                tooltip="Annualized money-weighted return over this horizon. It accounts for the amount and timing of portfolio cash flows. It is shown for context: asset contributions explain value created or lost in euros and do not add up mathematically to IRR."
              />
              <div className="mt-1 text-lg font-semibold tabular-nums text-teal-400">{irrLabel(irr, irrStatus)}</div>
            </div>
            <div>
              <MetricLabel
                label="Attributed net performance"
                tooltip="Sum of the attributed euro contributions across the selected assets and accounts: change in unrealized gains, realized gains on sales, dividends and interest over the period. This is a gross economic amount, not a return rate."
              />
              <div className={`mt-1 text-lg font-semibold tabular-nums ${netTone}`}>{fmtFull(summary.netContribution)}</div>
            </div>
            <div>
              <MetricLabel
                label="Period"
                tooltip="The snapshot range used for contribution attribution. Since tracking starts at the first available snapshot for each selected account; Trailing 3 years uses the same starting snapshot as the rolling IRR. The global end-date filter sets the end."
              />
              <div className="mt-1 text-sm font-medium text-gray-400">{formatDateRange(summary)}</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ContributionList title="Top contributors" items={summary.contributors} positive />
            <ContributionList title="Main detractors" items={summary.detractors} positive={false} />
          </div>
        </>
      )}
    </section>
  )
}
