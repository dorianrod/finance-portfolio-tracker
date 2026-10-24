import type { ReactNode } from 'react'
import { useId, useState } from 'react'

import type { buildLookThroughSummary } from '@/domains/portfolio/features/data-quality/components/helpers/presenters/buildLookThroughSummary'
import { QualityIndicatorCard } from '@/domains/portfolio/shared/components/quality/QualityIndicatorCard.view'
import type { FundCoverageReport } from '@/domains/portfolio/shared/types/fundHolding.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

type CompactCoverageCardData = {
  label: string
  amount: number
  percentage: number
  detail: string
  tooltip: string
  tone: 'coverage' | 'neutral' | 'warning' | 'muted'
}

function CompactCoverageCard({
  card,
  tooltipFooter,
}: {
  card: CompactCoverageCardData
  tooltipFooter: ReactNode
}) {
  return <QualityIndicatorCard tooltipFooter={tooltipFooter} {...card} />
}

export function LookThroughCoverageSummaryView({
  report,
  model,
  variant = 'detailed',
  tooltipFooter,
}: {
  report: FundCoverageReport
  model: ReturnType<typeof buildLookThroughSummary>
  variant?: 'compact' | 'detailed'
  tooltipFooter: ReactNode
}) {
  const formatMoney = useFormatMoney()
  const formatDate = useFormatDate()
  const {
    identifiedValue,
    unresolvedValue,
    selectedPortfolioValue,
    reliableValue,
    otherSourceValue,
    notApplicableValue,
    identifiedPercentage,
    unresolvedPercentage,
    notApplicablePercentage,
    hasNotApplicable,
    hasUnresolvedGap,
    reliablePercentage,
    otherSourcePercentage,
    directPercentage,
    decomposedPercentage,
    undisclosedPercentage,
    opaquePercentage,
    undisclosedTone,
    opaqueTone,
  } = model
  const readiness = {
    passed: i18n.t('ui.lookthroughcoveragesummary.ready'),
    pending_repeatability: i18n.t(
      'ui.lookthroughcoveragesummary.pendingVerification',
    ),
    limited: i18n.t('ui.lookthroughcoveragesummary.limited'),
  }[report.feasibilityStatus]

  if (variant === 'compact') {
    const cards = [
      {
        label: i18n.t('ui.lookthroughcoveragesummary.identifiedExposure'),
        amount: identifiedValue,
        percentage: identifiedPercentage,
        detail: i18n.t('ui.lookthroughcoveragesummary.identifiedDetail', {
          direct: formatMoney(report.directIdentifiedValue, { style: 'full' }),
          decomposed: formatMoney(report.decomposedValue, { style: 'full' }),
        }),
        tooltip: i18n.t(
          'ui.lookthroughcoveragesummary.shareOfTheTotalPortfolioWhoseEconomicExposureIs',
        ),
        tone: 'coverage' as const,
      },
      {
        label: i18n.t('ui.lookthroughcoveragesummary.reliableSubset'),
        amount: reliableValue,
        percentage: reliablePercentage,
        detail: i18n.t(
          'ui.lookthroughcoveragesummary.value0DirectPositionsPlusReliableFundSources',
          { value0: readiness },
        ),
        tooltip: i18n.t(
          'ui.lookthroughcoveragesummary.qualityFilteredSubsetOfIdentifiedExposureItIsNot',
        ),
        tone: 'neutral' as const,
      },
      {
        label: i18n.t('ui.lookthroughcoveragesummary.unresolvedExposure'),
        amount: unresolvedValue,
        percentage: unresolvedPercentage,
        detail: i18n.t('ui.lookthroughcoveragesummary.unresolvedDetail', {
          remainder: formatMoney(report.undisclosedFundValue, {
            style: 'full',
          }),
          opaque: formatMoney(report.opaqueValue, { style: 'full' }),
        }),
        tooltip: i18n.t(
          'ui.lookthroughcoveragesummary.complementOfIdentifiedExposureUndisclosedFundHoldingsPlusDirect',
        ),
        tone: hasUnresolvedGap ? ('warning' as const) : ('coverage' as const),
      },
      ...(hasNotApplicable
        ? [
            {
              label: i18n.t('ui.lookthroughcoveragesummary.notApplicable'),
              amount: notApplicableValue,
              percentage: notApplicablePercentage,
              detail: i18n.t(
                'ui.lookthroughcoveragesummary.savingsCheckingAndBrokerageCash',
              ),
              tooltip: i18n.t(
                'ui.lookthroughcoveragesummary.cashAccountBalancesIntentionallyExcludedFromLookThroughAnalysis',
              ),
              tone: 'muted' as const,
            },
          ]
        : []),
    ]
    return (
      <div
        className={`grid grid-cols-1 gap-3 ${hasNotApplicable ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}
      >
        {cards.map((card) => (
          <CompactCoverageCard
            key={card.label}
            card={card}
            tooltipFooter={tooltipFooter}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mx-auto max-w-sm">
        <QualityIndicatorCard
          tooltipFooter={tooltipFooter}
          label={i18n.t('ui.lookthroughcoveragesummary.portfolioScope')}
          tooltip={i18n.t(
            'ui.lookthroughcoveragesummary.totalSelectedPortfolioValueIncludingCashAccountsShownSeparately',
          )}
          amount={selectedPortfolioValue}
          percentage={100}
          detail={i18n.t('ui.lookthroughcoveragesummary.asOfDate', {
            date: formatDate(report.asOfDate, { style: 'isoDate' }),
          })}
        />
      </div>

      <div className="relative mx-auto hidden h-10 sm:block" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-surface-hover" />
        {hasNotApplicable ? (
          <>
            <div className="absolute left-[16.667%] right-[16.667%] top-5 h-px bg-surface-hover" />
            <div className="absolute bottom-0 left-[16.667%] top-5 w-px bg-gradient-to-b from-border-strong to-positive/40" />
            <div
              className={`absolute bottom-0 left-1/2 top-5 w-px bg-gradient-to-b from-border-strong ${hasUnresolvedGap ? 'to-warning/40' : 'to-positive/40'}`}
            />
            <div className="absolute bottom-0 left-[83.333%] top-5 w-px bg-gradient-to-b from-border-strong to-border-strong/40" />
          </>
        ) : (
          <>
            <div className="absolute left-1/4 right-1/4 top-5 h-px bg-surface-hover" />
            <div className="absolute bottom-0 left-1/4 top-5 w-px bg-gradient-to-b from-border-strong to-positive/40" />
            <div
              className={`absolute bottom-0 left-3/4 top-5 w-px bg-gradient-to-b from-border-strong ${hasUnresolvedGap ? 'to-warning/40' : 'to-positive/40'}`}
            />
          </>
        )}
      </div>
      <div
        className="mx-auto h-6 w-px bg-surface-hover sm:hidden"
        aria-hidden="true"
      />

      <div
        className={`grid grid-cols-1 items-start gap-3 ${hasNotApplicable ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}
      >
        <div>
          <QualityIndicatorCard
            tooltipFooter={tooltipFooter}
            label={i18n.t('ui.lookthroughcoveragesummary.identifiedExposure')}
            tooltip={i18n.t(
              'ui.lookthroughcoveragesummary.shareOfTheTotalPortfolioWhoseEconomicExposureIs',
            )}
            amount={identifiedValue}
            percentage={identifiedPercentage}
            detail={i18n.t(
              'ui.lookthroughcoveragesummary.directPositionsDecomposedFunds',
            )}
            tone="coverage"
          >
            <SourceReliability
              status={report.feasibilityStatus}

              reliableValue={reliableValue}

              reliablePercentage={reliablePercentage}

              otherSourceValue={otherSourceValue}

              otherSourcePercentage={otherSourcePercentage}
            />
          </QualityIndicatorCard>

          <ExposureChildNodes
            tooltipFooter={tooltipFooter}
            nodes={[
              {
                label: i18n.t('ui.lookthroughcoveragesummary.directPositions'),
                tooltip: i18n.t(
                  'ui.lookthroughcoveragesummary.identifiedNonFundPositionsHeldDirectlyInThePortfolio',
                ),
                amount: report.directIdentifiedValue,
                percentage: directPercentage,
                tone: 'coverage',
              },
              {
                label: i18n.t('ui.lookthroughcoveragesummary.decomposedFunds'),
                tooltip: i18n.t(
                  'ui.lookthroughcoveragesummary.fundAndEtfValueBrokenDownIntoUnderlyingHoldings',
                ),
                amount: report.decomposedValue,
                percentage: decomposedPercentage,
                tone: 'neutral',
              },
            ]}
          />
        </div>

        <div>
          <QualityIndicatorCard
            tooltipFooter={tooltipFooter}
            label={i18n.t('ui.lookthroughcoveragesummary.unresolvedExposure')}
            tooltip={i18n.t(
              'ui.lookthroughcoveragesummary.complementOfIdentifiedExposureUndisclosedFundHoldingsPlusDirect',
            )}
            amount={unresolvedValue}
            percentage={unresolvedPercentage}
            detail={i18n.t(
              'ui.lookthroughcoveragesummary.notYetVisibleThroughLookThroughAnalysis',
            )}
            tone={hasUnresolvedGap ? 'warning' : 'coverage'}
          />

          <ExposureChildNodes
            tooltipFooter={tooltipFooter}
            nodes={[
              {
                label: i18n.t(
                  'ui.lookthroughcoveragesummary.undisclosedFundRemainder',
                ),
                tooltip: i18n.t(
                  'ui.lookthroughcoveragesummary.fundValueNotCoveredByTheAvailableUnderlyingHoldings',
                ),
                amount: report.undisclosedFundValue,
                percentage: undisclosedPercentage,
                tone: undisclosedTone,
              },
              {
                label: i18n.t(
                  'ui.lookthroughcoveragesummary.opaquePositionsWithoutId',
                ),
                tooltip: i18n.t(
                  'ui.lookthroughcoveragesummary.directNonFundPositionsWithoutAnIsinOrTicker',
                ),
                amount: report.opaqueValue,
                percentage: opaquePercentage,
                tone: opaqueTone,
              },
            ]}
          />
        </div>
        {hasNotApplicable && (
          <QualityIndicatorCard
            tooltipFooter={tooltipFooter}
            label={i18n.t('ui.lookthroughcoveragesummary.notApplicable')}
            tooltip={i18n.t(
              'ui.lookthroughcoveragesummary.savingsCheckingAndBrokerageCashBalancesAreIntentionallyExcluded',
            )}
            amount={notApplicableValue}
            percentage={notApplicablePercentage}
            detail={i18n.t(
              'ui.lookthroughcoveragesummary.savingsCheckingAndBrokerageCash',
            )}
            tone="muted"
          />
        )}
      </div>
    </div>
  )
}

type ExposureChildNode = {
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
  const indicator = {
    passed: {
      label: i18n.t('ui.lookthroughcoveragesummary.good'),
      dot: 'bg-positive',
      badge: 'border-positive bg-positive-muted/40 text-positive',
    },
    pending_repeatability: {
      label: i18n.t('ui.lookthroughcoveragesummary.needsVerification'),
      dot: 'bg-warning',
      badge: 'border-warning bg-warning-muted/40 text-warning',
    },
    limited: {
      label: i18n.t('ui.lookthroughcoveragesummary.limited'),
      dot: 'bg-danger',
      badge: 'border-danger bg-danger-muted/40 text-danger',
    },
  }[status]

  return (
    <div>
      <button
        type="button"
        className="group mt-3 flex w-full items-center justify-between gap-3 border-t border-border pt-3 text-xs font-medium"
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${indicator.dot}`}
            aria-hidden="true"
          />
          <span className="truncate text-xs font-medium text-content-muted">
            {i18n.t('ui.lookthroughcoveragesummary.sourceReliability')}
          </span>
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${indicator.badge}`}
          >
            {indicator.label}
          </span>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-accent transition-colors group-hover:text-accent">
          <span>
            {isExpanded
              ? i18n.t('ui.lookthroughcoveragesummary.hideDetails')
              : i18n.t('ui.lookthroughcoveragesummary.details')}
          </span>
          <svg
            className={`h-3.5 w-3.5 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      {isExpanded && (
        <div id={detailsId} className="mt-3 border-t border-border pt-3">
          <BreakdownGroupContent
            className="mt-3"
            title={i18n.t(
              'ui.lookthroughcoveragesummary.sourceReliabilityDetails',
            )}
            note={i18n.t(
              'ui.lookthroughcoveragesummary.anotherViewOfTheSameIdentifiedExposure',
            )}

            rows={[
              {
                label: i18n.t('ui.lookthroughcoveragesummary.reliableSubset'),
                amount: reliableValue,
                percentage: reliablePercentage,
                color: SEMANTIC_COLORS.coverage,
              },
              {
                label: i18n.t('ui.lookthroughcoveragesummary.otherSourceTiers'),
                amount: otherSourceValue,
                percentage: otherSourcePercentage,
                color: SEMANTIC_COLORS.netContributions,
              },
            ]}
          />
          <p className="mt-3 text-[10px] leading-4 text-content-subtle">
            {i18n.t(
              'ui.lookthroughcoveragesummary.reliableIsAQualityFilteredSubsetDirectPositionsPlus',
            )}
          </p>
        </div>
      )}
    </div>
  )
}

function ExposureChildNodes({
  nodes,
  tooltipFooter,
}: {
  nodes: [ExposureChildNode, ExposureChildNode]
  tooltipFooter: ReactNode
}) {
  return (
    <div>
      <div className="relative hidden h-8 lg:block" aria-hidden="true">
        <div className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-surface-hover" />
        <div className="absolute left-1/4 right-1/4 top-4 h-px bg-surface-hover" />
        <div className="absolute bottom-0 left-1/4 top-4 w-px bg-surface-hover" />
        <div className="absolute bottom-0 left-3/4 top-4 w-px bg-surface-hover" />
      </div>
      <div
        className="mx-auto h-4 w-px bg-surface-hover lg:hidden"
        aria-hidden="true"
      />
      <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-2">
        {nodes.map((node) => (
          <ExposureChildNodeCard
            key={node.label}
            node={node}
            tooltipFooter={tooltipFooter}
          />
        ))}
      </div>
    </div>
  )
}

function ExposureChildNodeCard({
  node,
  tooltipFooter,
}: {
  node: ExposureChildNode
  tooltipFooter: ReactNode
}) {
  return (
    <QualityIndicatorCard
      tooltipFooter={tooltipFooter}
      label={node.label}
      tooltip={node.tooltip}
      amount={node.amount}
      percentage={node.percentage}
      detail={i18n.t('ui.lookthroughcoveragesummary.shareOfTotalPortfolio')}
      tone={node.tone}
    />
  )
}

type BreakdownRow = {
  label: string
  amount: number
  percentage: number
  color: string
}

type BreakdownGroupProps = {
  title: string
  note: string
  badge?: string
  rows: BreakdownRow[]
}

function BreakdownRowView({ row }: { row: BreakdownRow }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3 text-[11px]">
        <span className="truncate text-content-subtle">{row.label}</span>
        <span className="shrink-0 tabular-nums text-content-subtle">
          {formatMoney(row.amount, { style: 'full' })} ·{' '}
          {formatPercentage(row.percentage)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(0, row.percentage))}%`,
            backgroundColor: row.color,
          }}
        />
      </div>
    </div>
  )
}

function BreakdownGroupContent({
  title,
  note,
  badge,
  rows,
  className,
}: BreakdownGroupProps & { className: string }) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold text-content-muted">
            {title}
          </div>
          <div className="mt-0.5 text-[10px] text-content-subtle">{note}</div>
        </div>
        {badge && (
          <span className="shrink-0 rounded-full border border-border-strong bg-canvas/50 px-2 py-0.5 text-[10px] font-medium text-content-muted">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <BreakdownRowView key={row.label} row={row} />
        ))}
      </div>
    </div>
  )
}

export function UnavailableLookThroughSummary() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 text-sm text-content-subtle">
      {i18n.t(
        'ui.lookthroughcoveragesummary.noLookThroughQualityReportRunThePortfolioPipeline',
      )}
    </div>
  )
}
