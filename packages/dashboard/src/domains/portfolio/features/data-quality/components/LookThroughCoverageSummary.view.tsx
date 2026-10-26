import type { ReactNode } from 'react'
import { useState } from 'react'

import type { buildLookThroughSummary } from '@/domains/portfolio/features/data-quality/components/helpers/presenters/buildLookThroughSummary'
import { QualityIndicatorCard } from '@/domains/portfolio/shared/components/quality/QualityIndicatorCard.view'
import type { FundCoverageReport } from '@/domains/portfolio/shared/types/fundHolding.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import type { SemanticColorKey } from '@/shared/theme/semanticColors'
import { DecorativeBlock } from '@/shared/ui/Controls.view'
import { Disclosure } from '@/shared/ui/Disclosure.view'
import { DisclosureChevronIcon } from '@/shared/ui/Icons.view'
import { ReliabilityBadge } from '@/shared/ui/StatusBadge.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch, ToneSwatch } from '@/shared/ui/Swatch.view'
import { Text } from '@/shared/ui/Text.view'

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
  children,
}: {
  card: CompactCoverageCardData
  children: ReactNode
}) {
  return <QualityIndicatorCard {...card}>{children}</QualityIndicatorCard>
}

export function LookThroughCoverageSummaryView({
  report,
  model,
  variant = 'detailed',
  children,
}: {
  report: FundCoverageReport
  model: ReturnType<typeof buildLookThroughSummary>
  variant?: 'compact' | 'detailed'
  children: ReactNode
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
          <CompactCoverageCard key={card.label} card={card}>
            {children}
          </CompactCoverageCard>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mx-auto max-w-sm">
        <QualityIndicatorCard
          label={i18n.t('ui.lookthroughcoveragesummary.portfolioScope')}
          tooltip={i18n.t(
            'ui.lookthroughcoveragesummary.totalSelectedPortfolioValueIncludingCashAccountsShownSeparately',
          )}
          amount={selectedPortfolioValue}
          percentage={100}
          detail={i18n.t('ui.lookthroughcoveragesummary.asOfDate', {
            date: formatDate(report.asOfDate, { style: 'isoDate' }),
          })}
        >
          {children}
        </QualityIndicatorCard>
      </div>

      <DecorativeBlock className="relative mx-auto hidden h-10 sm:block">
        <Surface
          variant="centeredConnector"
          className="absolute left-1/2 top-0 h-5 w-px"
        />
        {hasNotApplicable ? (
          <>
            <Surface
              variant="highlighted"
              className="absolute left-[16.667%] right-[16.667%] top-5 h-px"
            />
            <Surface
              variant="positiveConnector"
              className="absolute bottom-0 left-[16.667%] top-5 w-px"
            />
            <Surface
              variant={
                hasUnresolvedGap ? 'warningConnector' : 'positiveConnector'
              }
              className="absolute bottom-0 left-1/2 top-5 w-px"
            />
            <Surface
              variant="neutralConnector"
              className="absolute bottom-0 left-[83.333%] top-5 w-px"
            />
          </>
        ) : (
          <>
            <Surface
              variant="highlighted"
              className="absolute left-1/4 right-1/4 top-5 h-px"
            />
            <Surface
              variant="positiveConnector"
              className="absolute bottom-0 left-1/4 top-5 w-px"
            />
            <Surface
              variant={
                hasUnresolvedGap ? 'warningConnector' : 'positiveConnector'
              }
              className="absolute bottom-0 left-3/4 top-5 w-px"
            />
          </>
        )}
      </DecorativeBlock>
      <DecorativeBlock
        variant="highlighted"
        className="mx-auto h-6 w-px sm:hidden"
      />

      <div
        className={`grid grid-cols-1 items-start gap-3 ${hasNotApplicable ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}
      >
        <div>
          <QualityIndicatorCard
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
            {children}
            <SourceReliability
              status={report.feasibilityStatus}
              reliableValue={reliableValue}
              reliablePercentage={reliablePercentage}
              otherSourceValue={otherSourceValue}
              otherSourcePercentage={otherSourcePercentage}
            />
          </QualityIndicatorCard>

          <ExposureChildNodes
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
          >
            {children}
          </ExposureChildNodes>
        </div>

        <div>
          <QualityIndicatorCard
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
          >
            {children}
          </QualityIndicatorCard>

          <ExposureChildNodes
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
          >
            {children}
          </ExposureChildNodes>
        </div>
        {hasNotApplicable && (
          <QualityIndicatorCard
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
          >
            {children}
          </QualityIndicatorCard>
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
  const indicator = {
    passed: {
      label: i18n.t('ui.lookthroughcoveragesummary.good'),
      tone: 'positive' as const,
    },
    pending_repeatability: {
      label: i18n.t('ui.lookthroughcoveragesummary.needsVerification'),
      tone: 'warning' as const,
    },
    limited: {
      label: i18n.t('ui.lookthroughcoveragesummary.limited'),
      tone: 'negative' as const,
    },
  }[status]

  return (
    <Disclosure expanded={isExpanded}>
      <Disclosure.Trigger
        type="button"
        variant="reliabilityToggle"
        className="mt-3 flex w-full items-center justify-between gap-3 pt-3"
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <div className="flex min-w-0 items-center gap-2">
          <ToneSwatch
            shape="dot"
            tone={indicator.tone}
            className="h-2.5 w-2.5 shrink-0"
          />
          <Text variant="captionLabel" tone="muted" truncate>
            {i18n.t('ui.lookthroughcoveragesummary.sourceReliability')}
          </Text>
          <ReliabilityBadge
            tone={indicator.tone}
            className="shrink-0 px-2 py-0.5"
          >
            {indicator.label}
          </ReliabilityBadge>
        </div>
        <Text
          variant="interactiveAccent"
          tone="accent"
          className="flex shrink-0 items-center gap-1.5"
        >
          <span>
            {isExpanded
              ? i18n.t('ui.lookthroughcoveragesummary.hideDetails')
              : i18n.t('ui.lookthroughcoveragesummary.details')}
          </span>
          <DisclosureChevronIcon expanded={isExpanded} />
        </Text>
      </Disclosure.Trigger>
      <Disclosure.Content variant="sectionStart" className="mt-3 pt-3">
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
              tone: 'coverage',
            },
            {
              label: i18n.t('ui.lookthroughcoveragesummary.otherSourceTiers'),
              amount: otherSourceValue,
              percentage: otherSourcePercentage,
              tone: 'netContributions',
            },
          ]}
        />
        <Text as="p" variant="tinyHelper" tone="subtle" className="mt-3">
          {i18n.t(
            'ui.lookthroughcoveragesummary.reliableIsAQualityFilteredSubsetDirectPositionsPlus',
          )}
        </Text>
      </Disclosure.Content>
    </Disclosure>
  )
}

function ExposureChildNodes({
  nodes,
  children,
}: {
  nodes: [ExposureChildNode, ExposureChildNode]
  children: ReactNode
}) {
  return (
    <div>
      <DecorativeBlock className="relative hidden h-8 lg:block">
        <Surface
          variant="centeredConnector"
          className="absolute left-1/2 top-0 h-4 w-px"
        />
        <Surface
          variant="highlighted"
          className="absolute left-1/4 right-1/4 top-4 h-px"
        />
        <Surface
          variant="highlighted"
          className="absolute bottom-0 left-1/4 top-4 w-px"
        />
        <Surface
          variant="highlighted"
          className="absolute bottom-0 left-3/4 top-4 w-px"
        />
      </DecorativeBlock>
      <DecorativeBlock
        variant="highlighted"
        className="mx-auto h-4 w-px lg:hidden"
      />
      <div className="grid grid-cols-1 items-start gap-2 lg:grid-cols-2">
        {nodes.map((node) => (
          <ExposureChildNodeCard key={node.label} node={node}>
            {children}
          </ExposureChildNodeCard>
        ))}
      </div>
    </div>
  )
}

function ExposureChildNodeCard({
  node,
  children,
}: {
  node: ExposureChildNode
  children: ReactNode
}) {
  return (
    <QualityIndicatorCard
      label={node.label}
      tooltip={node.tooltip}
      amount={node.amount}
      percentage={node.percentage}
      detail={i18n.t('ui.lookthroughcoveragesummary.shareOfTotalPortfolio')}
      tone={node.tone}
    >
      {children}
    </QualityIndicatorCard>
  )
}

type BreakdownRow = {
  label: string
  amount: number
  percentage: number
  tone: SemanticColorKey
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
      <Text
        as="div"
        variant="micro"
        className="mb-1 flex items-baseline justify-between gap-3"
      >
        <Text tone="subtle" truncate>
          {row.label}
        </Text>
        <Text tone="subtle" numeric className="shrink-0">
          {formatMoney(row.amount, { style: 'full' })} ·{' '}
          {formatPercentage(row.percentage)}
        </Text>
      </Text>
      <Surface variant="track" className="h-1.5 overflow-hidden">
        <SeriesSwatch
          as="div"
          shape="dot"
          tone={row.tone}
          className="h-full"
          style={{
            width: `${Math.min(100, Math.max(0, row.percentage))}%`,
          }}
        />
      </Surface>
    </div>
  )
}

function BreakdownGroupContent({
  title,
  note,
  badge,
  rows,
  className,
}: BreakdownGroupProps & { className: 'mt-3' }) {
  return (
    <div className={className}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <Text as="div" variant="microStrong" tone="muted">
            {title}
          </Text>
          <Text as="div" variant="tiny" tone="subtle" className="mt-0.5">
            {note}
          </Text>
        </div>
        {badge && (
          <Surface
            variant="quietCount"
            as="span"
            tone="muted"
            className="shrink-0 px-2 py-0.5"
          >
            {badge}
          </Surface>
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
    <Surface variant="contentCard" tone="subtle" className="p-4">
      {i18n.t(
        'ui.lookthroughcoveragesummary.noLookThroughQualityReportRunThePortfolioPipeline',
      )}
    </Surface>
  )
}

LookThroughCoverageSummaryView.TooltipFooter =
  QualityIndicatorCard.TooltipFooter
