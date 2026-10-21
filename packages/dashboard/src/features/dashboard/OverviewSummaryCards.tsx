import type { ReactNode } from 'react'
import type { IrrStatus } from '@/types/history'
import type {
  ComparedMetric,
  OverviewConcentrationComparison,
  OverviewComparison,
} from './overviewComparison.logic'
import { fmt, fmtPct } from '@/shared/format/money'
import { SEMANTIC_TEXT_CLASSES } from '@/shared/format/semanticColors'
import { InfoTooltip } from '@/features/kpis/InfoTooltip'
import type { FilterScopeSpec } from '@/shared/ui/FilterScopeBadges'

export type OverviewDestination = 'wealth' | 'performance' | 'allocation'

interface SummaryCardsProps {
  comparison: OverviewComparison
  heldConcentration: OverviewConcentrationComparison
  underlyingConcentration: OverviewConcentrationComparison
  rollingThreeYearTri: ComparedMetric
  irrStatus: IrrStatus
  onNavigate: (destination: OverviewDestination) => void
}

function money(value: number | null): string {
  return value == null ? '—' : fmt.format(value)
}

function signedMoney(value: number | null): string {
  if (value == null) return '—'
  return `${value > 0 ? '+' : ''}${fmt.format(value)}`
}

function percentage(value: number | null): string {
  return value == null ? '—' : fmtPct(value)
}

function points(value: number | null): string {
  if (value == null) return '—'
  return `${value > 0 ? '+' : ''}${value.toFixed(1)} pp`
}

function performanceTone(value: number | null): string {
  if (value == null) return 'text-gray-500'
  return value >= 0
    ? SEMANTIC_TEXT_CLASSES.performancePositive
    : SEMANTIC_TEXT_CLASSES.performanceNegative
}

function concentrationTone(value: number | null): string {
  if (value == null || value === 0) return 'text-gray-500'
  return value < 0
    ? SEMANTIC_TEXT_CLASSES.performancePositive
    : SEMANTIC_TEXT_CLASSES.performanceNegative
}

function DeltaBadge({ metric, tone = 'performance' }: {
  metric: ComparedMetric
  tone?: 'performance' | 'contributions' | 'concentration'
}) {
  const color = tone === 'contributions'
    ? SEMANTIC_TEXT_CLASSES.netContributions
    : tone === 'concentration'
      ? concentrationTone(metric.delta)
      : performanceTone(metric.delta)
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-gray-950/55 px-2 py-1 text-[11px] font-semibold tabular-nums ${color}`}>
      {tone === 'concentration' ? points(metric.delta) : signedMoney(metric.delta)}
      {tone !== 'concentration' && metric.deltaPct != null && (
        <span className="font-medium opacity-75">· {percentage(metric.deltaPct)}</span>
      )}
    </span>
  )
}

function CardShell({
  title,
  description,
  scope,
  eyebrow,
  destination,
  accent,
  onNavigate,
  children,
}: {
  title: string
  description: string
  scope: FilterScopeSpec
  eyebrow: string
  destination: OverviewDestination
  accent: string
  onNavigate: (destination: OverviewDestination) => void
  children: ReactNode
}) {
  return (
    <article className="group relative min-w-0 rounded-2xl border border-gray-800 bg-gray-900 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-gray-700 hover:bg-gray-900/80">
      <button type="button" onClick={() => onNavigate(destination)} aria-label={`Open ${title} details`} className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
      <span className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 rounded-t-2xl ${accent}`} aria-hidden="true" />
      <span className="pointer-events-none relative z-10 flex items-start justify-between gap-3">
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-600">{eyebrow}</span>
          <span className="mt-1 flex items-center text-sm font-semibold text-gray-200">
            {title}
            <span className="pointer-events-auto"><InfoTooltip text={description} scope={scope} /></span>
          </span>
        </span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-gray-700 transition-all group-hover:translate-x-0.5 group-hover:text-gray-400">
          <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="pointer-events-none relative z-10 mt-4 block">{children}</span>
    </article>
  )
}

function PreviousValue({ value, suffix = '' }: { value: number | null; suffix?: string }) {
  return (
    <span className="text-[11px] text-gray-600">
      Previous <span className="font-medium tabular-nums text-gray-400">{value == null ? 'Unavailable' : `${fmt.format(value)}${suffix}`}</span>
    </span>
  )
}

export function OverviewSummaryCards({
  comparison,
  heldConcentration,
  underlyingConcentration,
  rollingThreeYearTri,
  irrStatus,
  onNavigate,
}: SummaryCardsProps) {
  const underlyingAvailable = underlyingConcentration.current != null
  const primaryConcentration = underlyingAvailable ? underlyingConcentration : heldConcentration
  const primaryLabel = underlyingAvailable ? 'Underlying assets' : 'Held positions · limited view'

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <CardShell title="Portfolio value" description="Gross market value before estimated tax, measured at the end of the selected period." scope={{ account: 'filterable', period: 'as-of', effectiveDate: comparison.windows.current.end }} eyebrow="At period end" destination="wealth" accent="bg-cyan-400" onNavigate={onNavigate}>
        <span className="block text-2xl font-semibold tracking-tight tabular-nums text-white">{money(comparison.value.current)}</span>
        <span className="mt-3 flex flex-wrap items-center gap-2">
          <DeltaBadge metric={comparison.value} />
          <PreviousValue value={comparison.value.previous} />
        </span>
        <span className="mt-3 block text-[11px] text-gray-600">Gross market value before estimated tax</span>
      </CardShell>

      <CardShell title="Net contributions" description="Deposits minus withdrawals during the period, compared with the preceding period of equal length." scope={{ account: 'filterable', period: 'comparison-range' }} eyebrow="Cash flow" destination="wealth" accent="bg-blue-400" onNavigate={onNavigate}>
        <span className={`block text-2xl font-semibold tracking-tight tabular-nums ${SEMANTIC_TEXT_CLASSES.netContributions}`}>
          {money(comparison.contributions.current)}
        </span>
        <span className="mt-3 flex flex-wrap items-center gap-2">
          <DeltaBadge metric={comparison.contributions} tone="contributions" />
          <PreviousValue value={comparison.contributions.previous} />
        </span>
        <span className="mt-3 block text-[11px] text-gray-600">Deposits minus withdrawals during the period</span>
      </CardShell>

      <CardShell title="Performance & income" description="Market performance and passive income generated during the period, compared with the preceding period. The trailing three-year IRR is anchored at period end." scope={{ account: 'filterable', period: 'comparison-range' }} eyebrow="Period result" destination="performance" accent="bg-emerald-400" onNavigate={onNavigate}>
        <span className="flex items-baseline justify-between gap-2">
          <span className={`text-2xl font-semibold tracking-tight tabular-nums ${performanceTone(comparison.marketPerformance.current)}`}>
            {money(comparison.marketPerformance.current)}
          </span>
          <DeltaBadge metric={comparison.marketPerformance} />
        </span>
        <span className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-gray-600">Passive income</span>
          <span className={`font-semibold tabular-nums ${SEMANTIC_TEXT_CLASSES.passiveIncome}`}>
            {money(comparison.passiveIncome.current)}
            {comparison.passiveIncome.delta != null && <span className="ml-1.5 text-[10px] text-gray-500">({signedMoney(comparison.passiveIncome.delta)})</span>}
          </span>
        </span>
        <span className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-gray-800 pt-2 text-[11px] text-gray-600">
          <span className="inline-flex items-center">
            IRR · trailing 3y
            <span className="pointer-events-auto"><InfoTooltip text="Annualized money-weighted return over the three years ending at the selected period end." scope={{ account: 'filterable', period: 'trailing-3y', effectiveDate: comparison.windows.current.end }} /></span>
          </span>
          <span className={`font-semibold tabular-nums ${performanceTone(rollingThreeYearTri.current)}`}>
            {irrStatus === 'loading' ? 'Calculating…' : irrStatus === 'error' || rollingThreeYearTri.current == null ? '—' : fmtPct(rollingThreeYearTri.current, 2)}
          </span>
          {irrStatus === 'ready' && rollingThreeYearTri.delta != null && (
            <span className={`inline-flex rounded-full bg-gray-950/55 px-1.5 py-0.5 font-semibold tabular-nums ${performanceTone(rollingThreeYearTri.delta)}`}>
              {rollingThreeYearTri.delta > 0 ? '+' : ''}{rollingThreeYearTri.delta.toFixed(1)} pp
            </span>
          )}
          <span className="text-gray-600">
            Previous <span className="font-medium tabular-nums text-gray-400">{irrStatus === 'ready' && rollingThreeYearTri.previous != null ? fmtPct(rollingThreeYearTri.previous, 2) : '—'}</span>
          </span>
        </span>
      </CardShell>

      <CardShell title="Concentration" description="Share of the portfolio represented by the largest asset and the ten largest assets at period end." scope={{ account: 'filterable', period: 'as-of', effectiveDate: comparison.windows.current.end }} eyebrow={primaryLabel} destination="allocation" accent="bg-orange-400" onNavigate={onNavigate}>
        <span className="grid grid-cols-2 gap-4">
          <span>
            <span className="block text-[11px] text-gray-600">Largest asset</span>
            <span className={`mt-1 block text-xl font-semibold tabular-nums ${SEMANTIC_TEXT_CLASSES.risk}`}>
              {primaryConcentration.current ? `${primaryConcentration.current.topHoldingPct.toFixed(1)}%` : '—'}
            </span>
            <span className={`mt-1 block text-[10px] font-medium tabular-nums ${concentrationTone(primaryConcentration.topHolding.delta)}`}>
              {points(primaryConcentration.topHolding.delta)}
            </span>
          </span>
          <span>
            <span className="block text-[11px] text-gray-600">Top five</span>
            <span className={`mt-1 block text-xl font-semibold tabular-nums ${SEMANTIC_TEXT_CLASSES.riskSecondary}`}>
              {primaryConcentration.current ? `${primaryConcentration.current.topFivePct.toFixed(1)}%` : '—'}
            </span>
            <span className={`mt-1 block text-[10px] font-medium tabular-nums ${concentrationTone(primaryConcentration.topFive.delta)}`}>
              {points(primaryConcentration.topFive.delta)}
            </span>
          </span>
        </span>
        <span className="mt-3 block space-y-1 border-t border-gray-800 pt-2 text-[11px] text-gray-600">
          {underlyingAvailable ? (
            <span className="block text-gray-600">
              Held positions · largest {heldConcentration.current ? `${heldConcentration.current.topHoldingPct.toFixed(1)}%` : '—'} · top five {heldConcentration.current ? `${heldConcentration.current.topFivePct.toFixed(1)}%` : '—'}
            </span>
          ) : (
            <span className="block">Underlying detail unavailable · showing held positions</span>
          )}
        </span>
      </CardShell>
    </div>
  )
}
