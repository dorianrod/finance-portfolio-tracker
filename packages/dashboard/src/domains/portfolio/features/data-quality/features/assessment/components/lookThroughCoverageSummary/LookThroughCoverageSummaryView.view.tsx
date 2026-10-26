import type { ReactNode } from 'react'
import { useState } from 'react'

import type { buildLookThroughSummary } from '@/domains/portfolio/features/data-quality/features/assessment/components/helpers/presenters/buildLookThroughSummary'
import { QualityIndicatorCard } from '@/domains/portfolio/features/data-quality/features/assessment/components/QualityIndicatorCard.view'
import { PORTFOLIO_CHART_TONES } from '@/domains/portfolio/shared/constants/portfolioChartTones'
import type { FundCoverageReport } from '@/domains/portfolio/shared/types/fundHolding.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import type { ChartTone } from '@/shared/theme/chartColors/chartColors.types'
import { DecorativeBlock } from '@/shared/ui/controls/DecorativeBlock.view'
import { Disclosure } from '@/shared/ui/Disclosure.view'
import { DisclosureChevronIcon } from '@/shared/ui/icons/DisclosureChevronIcon.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Proportion } from '@/shared/ui/proportion/Proportion.view'
import { StatusBadge } from '@/shared/ui/statusBadge/StatusBadge.view'
import { Surface } from '@/shared/ui/Surface.view'
import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'
import { ToneSwatch } from '@/shared/ui/swatch/ToneSwatch.view'
import { Text } from '@/shared/ui/Text.view'
import { TreeConnector } from '@/shared/ui/TreeConnector.view'

export function LookThroughCoverageSummaryView({
  variant = 'detailed',
  ...props
}: CoverageSummaryProps) {
  if (variant === 'compact') return <CompactLookThroughSummary {...props} />
  return <DetailedLookThroughSummary {...props} />
}

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

type CoverageSummaryProps = {
  report: FundCoverageReport
  model: ReturnType<typeof buildLookThroughSummary>
  variant?: 'compact' | 'detailed'
  children: ReactNode
}

function CompactLookThroughSummary({
  model,
  report,
  children,
}: CoverageSummaryProps) {
  const formatMoney = useFormatMoney()
  const {
    identifiedValue,
    unresolvedValue,
    reliableValue,
    notApplicableValue,
    identifiedPercentage,
    unresolvedPercentage,
    notApplicablePercentage,
    hasNotApplicable,
    hasUnresolvedGap,
    reliablePercentage,
  } = model
  const readiness = {
    passed: i18n.t('ui.lookthroughcoveragesummary.ready'),
    pending_repeatability: i18n.t(
      'ui.lookthroughcoveragesummary.pendingVerification',
    ),
    limited: i18n.t('ui.lookthroughcoveragesummary.limited'),
  }[report.feasibilityStatus]

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
    <Layout
      flow="grid"
      gap="comfortable"
      arrangement={hasNotApplicable ? 'quartersMedium' : 'thirdsMedium'}
    >
      {cards.map((card) => (
        <CompactCoverageCard key={card.label} card={card}>
          {children}
        </CompactCoverageCard>
      ))}
    </Layout>
  )
}

function DetailedLookThroughSummary({
  model,
  report,
  children,
}: CoverageSummaryProps) {
  const formatDate = useFormatDate()
  const {
    selectedPortfolioValue,
    notApplicableValue,
    notApplicablePercentage,
    hasNotApplicable,
  } = model

  return (
    <div>
      <Layout width="compactReading" placement="centered">
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
      </Layout>

      <ExposureTreeConnectors model={model} />
      <Layout
        flow="grid"
        align="start"
        gap="comfortable"
        arrangement={hasNotApplicable ? 'thirdsSmall' : 'pairSmall'}
      >
        <IdentifiedExposureBranch report={report} model={model}>
          {children}
        </IdentifiedExposureBranch>

        <UnresolvedExposureBranch report={report} model={model}>
          {children}
        </UnresolvedExposureBranch>
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
      </Layout>
    </div>
  )
}

function ExposureTreeConnectors({
  model,
}: Pick<CoverageSummaryProps, 'model'>) {
  const { hasNotApplicable, hasUnresolvedGap } = model
  return (
    <>
      <Layout placement="centeredRelative" height="connector">
        <DecorativeBlock>
          <Layout flow="block" hiddenUntil="small">
            <TreeConnector position="stem">
              <Surface variant="centeredConnector" />
            </TreeConnector>
            {hasNotApplicable ? (
              <>
                <TreeConnector position="bridge">
                  <Surface variant="highlighted" />
                </TreeConnector>
                <TreeConnector position="left">
                  <Surface variant="positiveConnector" />
                </TreeConnector>
                <TreeConnector position="center">
                  <Surface
                    variant={
                      hasUnresolvedGap
                        ? 'warningConnector'
                        : 'positiveConnector'
                    }
                  />
                </TreeConnector>
                <TreeConnector position="right">
                  <Surface variant="neutralConnector" />
                </TreeConnector>
              </>
            ) : (
              <>
                <TreeConnector position="pairBridge">
                  <Surface variant="highlighted" />
                </TreeConnector>
                <TreeConnector position="pairLeft">
                  <Surface variant="positiveConnector" />
                </TreeConnector>
                <TreeConnector position="pairRight">
                  <Surface
                    variant={
                      hasUnresolvedGap
                        ? 'warningConnector'
                        : 'positiveConnector'
                    }
                  />
                </TreeConnector>
              </>
            )}
          </Layout>
        </DecorativeBlock>
      </Layout>
      <Layout placement="centered" height="shortConnector" width="divider">
        <DecorativeBlock variant="highlighted">
          <Layout></Layout>
        </DecorativeBlock>
      </Layout>
    </>
  )
}

function IdentifiedExposureBranch({
  model,
  report,
  children,
}: CoverageSummaryProps) {
  const {
    identifiedValue,
    reliableValue,
    otherSourceValue,
    identifiedPercentage,
    reliablePercentage,
    otherSourcePercentage,
    directPercentage,
    decomposedPercentage,
  } = model
  return (
    <>
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
    </>
  )
}

function UnresolvedExposureBranch({
  model,
  report,
  children,
}: CoverageSummaryProps) {
  const {
    unresolvedValue,
    unresolvedPercentage,
    hasUnresolvedGap,
    undisclosedPercentage,
    opaquePercentage,
    undisclosedTone,
    opaqueTone,
  } = model
  return (
    <>
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
    </>
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
      <Layout as="span" flow="inlineGrid" spaceBefore="default" width="full">
        <Disclosure.Trigger
          type="button"
          variant="separatedToggle"
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          <Inline as="div" align="center" gap="default">
            <Layout as="span" flow="inline" height="indicator" sizing="fixed">
              <ToneSwatch shape="dot" tone={indicator.tone} />
            </Layout>
            <Text variant="captionLabel" tone="muted" truncate>
              {i18n.t('ui.lookthroughcoveragesummary.sourceReliability')}
            </Text>
            <Layout as="span" flow="inline" sizing="fixed">
              <StatusBadge tone={indicator.tone}>
                <Layout as="span" flow="inline" inset="compact">
                  {indicator.label}
                </Layout>
              </StatusBadge>
            </Layout>
          </Inline>
          <Layout as="span" flow="block" sizing="fixed">
            <Text variant="interactiveAccent" tone="accent">
              <Inline as="span" align="center" gap="compact">
                <span>
                  {isExpanded
                    ? i18n.t('ui.lookthroughcoveragesummary.hideDetails')
                    : i18n.t('ui.lookthroughcoveragesummary.details')}
                </span>
                <DisclosureChevronIcon expanded={isExpanded} />
              </Inline>
            </Text>
          </Layout>
        </Disclosure.Trigger>
      </Layout>
      <Layout spaceBefore="default">
        <Disclosure.Content variant="sectionStart">
          <Inset inset="default">
            <Layout as="span" spaceBefore="default">
              <BreakdownGroupContent
                title={i18n.t(
                  'ui.lookthroughcoveragesummary.sourceReliabilityDetails',
                )}
                note={i18n.t(
                  'ui.lookthroughcoveragesummary.anotherViewOfTheSameIdentifiedExposure',
                )}
                rows={[
                  {
                    label: i18n.t(
                      'ui.lookthroughcoveragesummary.reliableSubset',
                    ),
                    amount: reliableValue,
                    percentage: reliablePercentage,
                    tone: PORTFOLIO_CHART_TONES.coverage,
                  },
                  {
                    label: i18n.t(
                      'ui.lookthroughcoveragesummary.otherSourceTiers',
                    ),
                    amount: otherSourceValue,
                    percentage: otherSourcePercentage,
                    tone: PORTFOLIO_CHART_TONES.netContributions,
                  },
                ]}
              />
            </Layout>
            <Layout spaceBefore="default">
              <Text as="p" variant="tinyHelper" tone="subtle">
                {i18n.t(
                  'ui.lookthroughcoveragesummary.reliableIsAQualityFilteredSubsetDirectPositionsPlus',
                )}
              </Text>
            </Layout>
          </Inset>
        </Disclosure.Content>
      </Layout>
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
      <Layout placement="inset" height="branchConnector">
        <DecorativeBlock>
          <Layout flow="block" hiddenUntil="large">
            <TreeConnector position="stem">
              <Surface variant="centeredConnector" />
            </TreeConnector>
            <TreeConnector position="pairBridge">
              <Surface variant="highlighted" />
            </TreeConnector>
            <TreeConnector position="pairLeft">
              <Surface variant="highlighted" />
            </TreeConnector>
            <TreeConnector position="pairRight">
              <Surface variant="highlighted" />
            </TreeConnector>
          </Layout>
        </DecorativeBlock>
      </Layout>
      <Layout placement="centered" height="icon" width="divider">
        <DecorativeBlock variant="highlighted">
          <Layout></Layout>
        </DecorativeBlock>
      </Layout>
      <Layout flow="grid" arrangement="pairLarge" align="start" gap="default">
        {nodes.map((node) => (
          <ExposureChildNodeCard key={node.label} node={node}>
            {children}
          </ExposureChildNodeCard>
        ))}
      </Layout>
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
  tone: ChartTone
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
      <Layout spaceAfter="compact">
        <Text as="div" variant="micro">
          <Inline as="div" align="baseline" justify="between" gap="default">
            <Text tone="subtle" truncate>
              {row.label}
            </Text>
            <Layout as="span" flow="inline" sizing="fixed">
              <Text tone="subtle" numeric>
                {formatMoney(row.amount, { style: 'full' })} ·{' '}
                {formatPercentage(row.percentage)}
              </Text>
            </Layout>
          </Inline>
        </Text>
      </Layout>
      <Layout height="track" overflow="clip">
        <Surface variant="track">
          <Proportion value={Math.min(100, Math.max(0, row.percentage))}>
            <SeriesSwatch as="div" shape="dot" tone={row.tone} />
          </Proportion>
        </Surface>
      </Layout>
    </div>
  )
}

function BreakdownGroupContent({
  title,
  note,
  badge,
  rows,
}: BreakdownGroupProps) {
  return (
    <Layout>
      <Inline
        as="div"
        spaceAfter="default"
        align="start"
        justify="between"
        gap="default"
      >
        <div>
          <Text as="div" variant="microStrong" tone="muted">
            {title}
          </Text>
          <Layout spaceBefore="compact">
            <Text as="div" variant="tiny" tone="subtle">
              {note}
            </Text>
          </Layout>
        </div>
        {badge && (
          <Layout as="span" flow="inline" sizing="fixed">
            <Surface variant="quietCount" as="span" tone="muted">
              {badge}
            </Surface>
          </Layout>
        )}
      </Inline>
      <Stack gap="default">
        {rows.map((row) => (
          <BreakdownRowView key={row.label} row={row} />
        ))}
      </Stack>
    </Layout>
  )
}

LookThroughCoverageSummaryView.TooltipFooter =
  QualityIndicatorCard.TooltipFooter
