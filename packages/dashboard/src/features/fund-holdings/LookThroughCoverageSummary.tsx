import { useId, useState } from 'react'
import type { FundCoverageReport } from '@/hooks/useFundHoldings'
import { fmtFull } from '@/shared/format/money'
import { SEMANTIC_COLORS } from '@/shared/format/semanticColors'
import { QualityIndicatorCard } from '@/shared/ui/QualityIndicatorCard'

export function LookThroughCoverageSummary({ report, compact = false }: {
  report: FundCoverageReport | null
  compact?: boolean
}) {
  if (!report) return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-sm text-gray-500">
      No look-through quality report. Run the portfolio pipeline to generate it.
    </div>
  )

  const percentageOfPortfolio = (value: number) => report.portfolioValue > 0
    ? value / report.portfolioValue * 100
    : 0
  const identifiedValue = report.directIdentifiedValue + report.decomposedValue
  const unresolvedValue = report.undisclosedFundValue + report.opaqueValue
  const reliableValue = Math.min(
    identifiedValue,
    report.directIdentifiedValue + report.highConfidenceExplainedValue,
  )
  const otherSourceValue = Math.max(0, identifiedValue - reliableValue)
  const readiness = report.feasibilityStatus === 'passed'
    ? 'Ready'
    : report.feasibilityStatus === 'pending_repeatability'
      ? 'Pending verification'
      : 'Limited'

  if (compact) {
    const cards = [
      {
        label: 'Identified exposure',
        amount: identifiedValue,
        percentage: percentageOfPortfolio(identifiedValue),
        detail: `${fmtFull(report.directIdentifiedValue)} direct · ${fmtFull(report.decomposedValue)} decomposed funds`,
        tooltip: 'Share of the total portfolio whose economic exposure is visible, either directly or through decomposed fund holdings.',
        tone: 'coverage' as const,
      },
      {
        label: 'Reliable subset',
        amount: reliableValue,
        percentage: percentageOfPortfolio(reliableValue),
        detail: `${readiness} · direct positions plus reliable fund sources`,
        tooltip: 'Quality-filtered subset of identified exposure. It is not an additional portfolio slice: it combines identified direct positions with fund holdings from reliable sources (official holdings or exact proxies).',
        tone: 'neutral' as const,
      },
      {
        label: 'Unresolved exposure',
        amount: unresolvedValue,
        percentage: percentageOfPortfolio(unresolvedValue),
        detail: `${fmtFull(report.undisclosedFundValue)} fund remainder · ${fmtFull(report.opaqueValue)} without ID`,
        tooltip: 'Complement of identified exposure: undisclosed fund holdings plus direct positions without an ISIN or ticker.',
        tone: 'warning' as const,
      },
    ]
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {cards.map((card) => <QualityIndicatorCard key={card.label} {...card} />)}
      </div>
    )
  }

  return (
    <div>
      <div className="mx-auto max-w-sm">
        <QualityIndicatorCard
          label="Portfolio scope"
          tooltip="Total portfolio value included in the look-through completeness check."
          amount={report.portfolioValue}
          percentage={100}
          detail={`As of ${report.asOfDate || 'latest portfolio snapshot'}`}
        />
      </div>

      <div className="relative mx-auto hidden h-10 sm:block" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-gray-700" />
        <div className="absolute left-1/4 right-1/4 top-5 h-px bg-gray-700" />
        <div className="absolute bottom-0 left-1/4 top-5 w-px bg-gradient-to-b from-gray-700 to-emerald-500/40" />
        <div className="absolute bottom-0 left-3/4 top-5 w-px bg-gradient-to-b from-gray-700 to-amber-500/40" />
      </div>
      <div className="mx-auto h-6 w-px bg-gray-700 sm:hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
        <div>
          <QualityIndicatorCard
            label="Identified exposure"
            tooltip="Share of the total portfolio whose economic exposure is visible, either directly or through decomposed fund holdings."
            amount={identifiedValue}
            percentage={percentageOfPortfolio(identifiedValue)}
            detail="Direct positions + decomposed funds"
            tone="coverage"
          >
            <SourceReliability
              status={report.feasibilityStatus}
              reliableValue={reliableValue}
              reliablePercentage={percentageOfPortfolio(reliableValue)}
              otherSourceValue={otherSourceValue}
              otherSourcePercentage={percentageOfPortfolio(otherSourceValue)}
            />
          </QualityIndicatorCard>
          <ExposureChildNodes nodes={[
            {
              label: 'Direct positions',
              tooltip: 'Identified non-fund positions held directly in the portfolio.',
              amount: report.directIdentifiedValue,
              percentage: percentageOfPortfolio(report.directIdentifiedValue),
              tone: 'coverage',
            },
            {
              label: 'Decomposed funds',
              tooltip: 'Fund and ETF value broken down into underlying holdings, across all available source-quality tiers.',
              amount: report.decomposedValue,
              percentage: percentageOfPortfolio(report.decomposedValue),
              tone: 'neutral',
            },
          ]} />
        </div>

        <div>
          <QualityIndicatorCard
            label="Unresolved exposure"
            tooltip="Complement of identified exposure: undisclosed fund holdings plus direct positions without an ISIN or ticker."
            amount={unresolvedValue}
            percentage={percentageOfPortfolio(unresolvedValue)}
            detail="Not yet visible through look-through analysis"
            tone="warning"
          />
          <ExposureChildNodes nodes={[
            {
              label: 'Undisclosed fund remainder',
              tooltip: 'Fund value not covered by the available underlying-holdings decomposition.',
              amount: report.undisclosedFundValue,
              percentage: percentageOfPortfolio(report.undisclosedFundValue),
              tone: 'warning',
            },
            {
              label: 'Opaque positions without ID',
              tooltip: 'Direct non-fund positions without an ISIN or ticker, which cannot yet be identified precisely.',
              amount: report.opaqueValue,
              percentage: percentageOfPortfolio(report.opaqueValue),
              tone: 'error',
            },
          ]} />
        </div>
      </div>
    </div>
  )
}

interface ExposureChildNode {
  label: string
  tooltip: string
  amount: number
  percentage: number
  tone: 'neutral' | 'coverage' | 'warning' | 'error'
}

function SourceReliability({
  status,
  reliableValue,
  reliablePercentage,
  otherSourceValue,
  otherSourcePercentage,
}: {
  status: FundCoverageReport['feasibilityStatus']
  reliableValue: number
  reliablePercentage: number
  otherSourceValue: number
  otherSourcePercentage: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const detailsId = useId()
  const indicator = status === 'passed'
    ? { label: 'Good', dot: 'bg-emerald-500', badge: 'border-emerald-800 bg-emerald-950/40 text-emerald-300' }
    : status === 'pending_repeatability'
      ? { label: 'Needs verification', dot: 'bg-amber-500', badge: 'border-amber-800 bg-amber-950/40 text-amber-300' }
      : { label: 'Limited', dot: 'bg-red-500', badge: 'border-red-800 bg-red-950/40 text-red-300' }

  return (
    <div>
      <button
        type="button"
        className="group mt-3 flex w-full items-center justify-between gap-3 border-t border-gray-800 pt-3 text-xs font-medium"
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${indicator.dot}`} aria-hidden="true" />
          <span className="truncate text-xs font-medium text-gray-400">Source reliability</span>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${indicator.badge}`}>{indicator.label}</span>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-blue-400 transition-colors group-hover:text-blue-300">
          <span>{isExpanded ? 'Hide details' : 'Details'}</span>
          <svg className={`h-3.5 w-3.5 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </span>
      </button>
      {isExpanded && (
        <div id={detailsId} className="mt-3 border-t border-gray-800 pt-3">
          <BreakdownGroup
            title="Source reliability details"
            note="Another view of the same identified exposure"
            bordered={false}
            rows={[
              { label: 'Reliable subset', amount: reliableValue, percentage: reliablePercentage, color: SEMANTIC_COLORS.coverage },
              { label: 'Other source tiers', amount: otherSourceValue, percentage: otherSourcePercentage, color: SEMANTIC_COLORS.netContributions },
            ]}
          />
          <p className="mt-3 text-[10px] leading-4 text-gray-600">
            Reliable is a quality-filtered subset: direct positions plus official fund holdings or exact proxies. It is not an additional portfolio slice.
          </p>
        </div>
      )}
    </div>
  )
}

function ExposureChildNodes({ nodes }: { nodes: [ExposureChildNode, ExposureChildNode] }) {
  return (
    <div>
      <div className="relative hidden h-8 lg:block" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-gray-700" />
        <div className="absolute left-1/4 right-1/4 top-4 h-px bg-gray-700" />
        <div className="absolute bottom-0 left-1/4 top-4 w-px bg-gray-700" />
        <div className="absolute bottom-0 left-3/4 top-4 w-px bg-gray-700" />
      </div>
      <div className="mx-auto h-4 w-px bg-gray-700 lg:hidden" aria-hidden="true" />
      <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-2">
        {nodes.map((node) => (
          <QualityIndicatorCard
            key={node.label}
            label={node.label}
            tooltip={node.tooltip}
            amount={node.amount}
            percentage={node.percentage}
            detail="Share of total portfolio"
            tone={node.tone}
          />
        ))}
      </div>
    </div>
  )
}

interface BreakdownRow {
  label: string
  amount: number
  percentage: number
  color: string
}

function BreakdownGroup({
  title, note, badge, rows, bordered = true,
}: {
  title: string
  note: string
  badge?: string
  rows: BreakdownRow[]
  bordered?: boolean
}) {
  return (
    <div className={bordered ? 'mt-3 border-t border-gray-800 pt-3' : 'mt-3'}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold text-gray-400">{title}</div>
          <div className="mt-0.5 text-[10px] text-gray-600">{note}</div>
        </div>
        {badge && <span className="shrink-0 rounded-full border border-gray-700 bg-gray-950/50 px-2 py-0.5 text-[10px] font-medium text-gray-400">{badge}</span>}
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[11px]">
              <span className="truncate text-gray-500">{row.label}</span>
              <span className="shrink-0 tabular-nums text-gray-500">{fmtFull(row.amount)} · {formatPercentage(row.percentage)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, row.percentage))}%`, backgroundColor: row.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatPercentage(value: number) {
  if (value > 0 && value < 0.1) return value.toFixed(2)
  return value.toFixed(1)
}
