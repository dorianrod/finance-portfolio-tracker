import type { ReactNode } from 'react'
import { useState } from 'react'

import { QualityIndicatorCard } from '@/domains/portfolio/features/data-quality/features/assessment/components/QualityIndicatorCard.view'
import type { summarizeAllocationCoverage } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/transformers/computeAllocationCoverage/summarizeAllocationCoverage'
import i18n from '@/i18n/i18n'
import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { Disclosure } from '@/shared/ui/Disclosure.view'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Text } from '@/shared/ui/Text.view'

import { AllocationCoverageConnectors } from './AllocationCoverageConnectors.view'
import { DetailToggle } from './DetailToggle.view'

export function AllocationCoverageCardView({
  summary,
  hasUnmappedGap,
  children,
}: {
  summary: ReturnType<typeof summarizeAllocationCoverage>
  hasUnmappedGap: boolean
  children: ReactNode
}) {
  const [expandedDetail, setExpandedDetail] = useState<
    'accounts' | 'dimensions' | null
  >(null)
  const { slot: scope, content: details } = partitionSlot(children, Scope)
  const { slot: accounts, content } = partitionSlot(details, Accounts)
  const { slot: dimensions } = partitionSlot(content, Dimensions)
  const {
    allocated: totalAllocated,
    unallocated: totalUnallocated,
    notApplicable: totalNotApplicable,
    total,
    allocatedPct: mappedPct,
    unallocatedPct: unmappedPct,
    notApplicablePct,
  } = summary
  return (
    <div>
      <Layout>
        <QualityIndicatorCard
          label={i18n.t('ui.allocationcoveragecard.portfolioScope')}
          tooltip={i18n.t(
            'ui.allocationcoveragecard.totalValueOfTheCurrentActivePositionsIncludedIn',
          )}
          amount={total}
          percentage={100}
          detail={i18n.t('ui.allocationcoveragecard.currentActivePortfolio')}
        >
          <QualityIndicatorCard.TooltipFooter>
            {scope}
          </QualityIndicatorCard.TooltipFooter>
        </QualityIndicatorCard>
      </Layout>

      <AllocationCoverageConnectors hasUnmappedGap={hasUnmappedGap} />

      <Grid columns={3} align="start" gap="default">
        <QualityIndicatorCard
          label={i18n.t('ui.allocationcoveragecard.mappedPositions')}
          tooltip={i18n.t(
            'ui.allocationcoveragecard.currentPositionValueFoundInAtLeastOneAllocation',
          )}
          amount={totalAllocated}
          percentage={mappedPct}
          detail={i18n.t('ui.allocationcoveragecard.shareOfSelectedPortfolio')}
          tone="coverage"
        >
          <QualityIndicatorCard.TooltipFooter>
            {scope}
          </QualityIndicatorCard.TooltipFooter>
          <Disclosure expanded={expandedDetail === 'accounts'}>
            <DetailToggle
              label={i18n.t('ui.allocationcoveragecard.detailsByAccount')}
              expanded={expandedDetail === 'accounts'}
              onClick={() =>
                setExpandedDetail((current) =>
                  current === 'accounts' ? null : 'accounts',
                )
              }
            />
            <Layout spaceBefore="default">
              <Disclosure.Content variant="sectionStart">
                <Stack gap="relaxed" inset="default">
                  {accounts}
                </Stack>
              </Disclosure.Content>
            </Layout>
          </Disclosure>
        </QualityIndicatorCard>
        <QualityIndicatorCard
          label={i18n.t('ui.allocationcoveragecard.unmappedPositions')}
          tooltip={i18n.t(
            'ui.allocationcoveragecard.positionValueWithNoAllocationRowFoundTogetherWith',
          )}
          amount={totalUnallocated}
          percentage={unmappedPct}
          detail={
            totalUnallocated > 0
              ? i18n.t('ui.allocationcoveragecard.noAllocationRowFound')
              : i18n.t('ui.allocationcoveragecard.allApplicablePositionsMapped')
          }
          tone={hasUnmappedGap ? 'warning' : 'coverage'}
        >
          <QualityIndicatorCard.TooltipFooter>
            {scope}
          </QualityIndicatorCard.TooltipFooter>
          <Disclosure expanded={expandedDetail === 'dimensions'}>
            <DetailToggle
              label={i18n.t('ui.allocationcoveragecard.detailsByDimension')}
              expanded={expandedDetail === 'dimensions'}
              onClick={() =>
                setExpandedDetail((current) =>
                  current === 'dimensions' ? null : 'dimensions',
                )
              }
            />
            <Layout spaceBefore="default">
              <Disclosure.Content variant="sectionStart">
                <Inset inset="default">
                  <Layout spaceAfter="default">
                    <Text as="p" variant="microHelper" tone="subtle">
                      {i18n.t(
                        'ui.allocationcoveragecard.unmappedPositionsAreNcInEveryDimensionMappedRows',
                      )}
                    </Text>
                  </Layout>
                  {dimensions}
                </Inset>
              </Disclosure.Content>
            </Layout>
          </Disclosure>
        </QualityIndicatorCard>
        <QualityIndicatorCard
          label={i18n.t('ui.allocationcoveragecard.notApplicable')}
          tooltip={i18n.t(
            'ui.allocationcoveragecard.savingsCheckingAndBrokerageCashBalancesAreIntentionallyExcluded',
          )}
          amount={totalNotApplicable}
          percentage={notApplicablePct}
          detail={i18n.t(
            'ui.allocationcoveragecard.savingsCheckingAndBrokerageCash',
          )}
          tone="muted"
        >
          <QualityIndicatorCard.TooltipFooter>
            {scope}
          </QualityIndicatorCard.TooltipFooter>
        </QualityIndicatorCard>
      </Grid>
    </div>
  )
}
function Scope({ children }: { children: ReactNode }) {
  return <>{children}</>
}
function Accounts({ children }: { children: ReactNode }) {
  return <>{children}</>
}
function Dimensions({ children }: { children: ReactNode }) {
  return <>{children}</>
}
AllocationCoverageCardView.Scope = Scope
AllocationCoverageCardView.Accounts = Accounts
AllocationCoverageCardView.Dimensions = Dimensions
