import { useState } from 'react'
import type { IrrStatus } from '@/types/history'
import { InfoTooltip } from '@/features/kpis/InfoTooltip'
import { fmtFull, fmtPct } from '@/shared/format/money'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import type {
  ContributionHorizon,
  PerformanceContribution,
  PerformanceContributionSummary,
} from './performanceContribution.logic'

interface Props {
  sinceTracking: PerformanceContributionSummary
  trailingThreeYears: PerformanceContributionSummary
  sinceTrackingIrr: number | null
  trailingThreeYearIrr: number | null
  irrStatus: IrrStatus
}

function formatDateRange(summary: PerformanceContributionSummary): string {
  if (!summary.startDate || !summary.endDate) return ''
  const format = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
  return `${format(summary.startDate)} – ${format(summary.endDate)}`
}

function irrLabel(value: number | null, status: IrrStatus): string {
  if (status === 'loading') return 'Calculating…'
  if (status === 'error') return 'Unavailable'
  return value === null ? 'Not available' : fmtPct(value, 2)
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

export function PerformanceContributionCard({
  sinceTracking,
  trailingThreeYears,
  sinceTrackingIrr,
  trailingThreeYearIrr,
  irrStatus,
}: Props) {
  const [horizon, setHorizon] = useState<ContributionHorizon>('since-tracking')
  const threeYearUnavailable = !trailingThreeYears.available || trailingThreeYearIrr === null
  const activeHorizon = horizon === 'trailing-3y' && threeYearUnavailable ? 'since-tracking' : horizon
  const summary = activeHorizon === 'since-tracking' ? sinceTracking : trailingThreeYears
  const irr = activeHorizon === 'since-tracking' ? sinceTrackingIrr : trailingThreeYearIrr
  const netTone = summary.netContribution >= 0
    ? SEMANTIC_TEXT_CLASSES.performancePositive
    : SEMANTIC_TEXT_CLASSES.performanceNegative

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center">
            <h2 className="text-sm font-medium text-gray-400">Contribution to performance</h2>
            <InfoTooltip text="Economic attribution: change in unrealized gain plus realized gains, dividends and interest. It explains value creation, not a mathematical split of the IRR percentage." />
          </div>
          <p className="mt-1 text-xs text-gray-600">Main assets creating or reducing portfolio value.</p>
        </div>
        <div className="inline-flex self-start rounded-lg border border-gray-700 bg-gray-950 p-0.5" aria-label="Contribution horizon">
          <button
            type="button"
            onClick={() => setHorizon('since-tracking')}
            aria-pressed={activeHorizon === 'since-tracking'}
            className={`rounded-md px-2.5 py-1 text-xs transition-colors ${activeHorizon === 'since-tracking' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Since tracking
          </button>
          <button
            type="button"
            onClick={() => setHorizon('trailing-3y')}
            disabled={threeYearUnavailable}
            aria-pressed={activeHorizon === 'trailing-3y'}
            title={threeYearUnavailable ? 'Three years of history are not yet available' : undefined}
            className={`rounded-md px-2.5 py-1 text-xs transition-colors ${activeHorizon === 'trailing-3y' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'} disabled:cursor-not-allowed disabled:text-gray-700`}
          >
            Trailing 3 years
          </button>
        </div>
      </div>

      {!summary.available ? (
        <div className="mt-5 rounded-lg border border-dashed border-gray-800 py-10 text-center text-sm text-gray-600">
          Contribution history is not available for this selection.
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-800 bg-gray-950/40 p-3 sm:grid-cols-3">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-gray-600">IRR context</div>
              <div className="mt-1 text-lg font-semibold tabular-nums text-teal-400">{irrLabel(irr, irrStatus)}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-gray-600">Attributed net performance</div>
              <div className={`mt-1 text-lg font-semibold tabular-nums ${netTone}`}>{fmtFull(summary.netContribution)}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-gray-600">Period</div>
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
