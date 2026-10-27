import type { ReactNode } from 'react'
import { Fragment, useCallback, useState } from 'react'

import type {
  buildFundDiagnosticsRows,
  FundDiagnosticsFilter,
} from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/buildFundDiagnosticsRows'
import { getFundQualitySourceLabel as fundQualitySourceLabel } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/presenters/getFundQualitySourceLabel'
import type { FundSnapshot } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundSnapshot.type'
import type { FundUnresolved } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundUnresolved.type'
import { FUND_QUALITY_LABELS } from '@/domains/portfolio/shared/helpers/presenters/getFundQualityPresentation/fundQualityLabels'
import type { FundHolding } from '@/domains/portfolio/shared/types/fundHolding.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Button } from '@/shared/ui/controls/Button.view'
import { ExternalLink } from '@/shared/ui/ExternalLink.view'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SidePanel } from '@/shared/ui/SidePanel.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { FundQualityBadge } from './FundQualityBadge.view'

export function FundDataQualityPanelView({
  open,
  onClose,
  filter,
  onSelect,
  rows,
}: {
  open: boolean
  onClose: () => void
  filter: FundDiagnosticsFilter
  onSelect: (filter: FundDiagnosticsFilter) => void
  rows: ReturnType<typeof buildFundDiagnosticsRows>
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const toggleExpanded = useCallback(
    (id: string) => setExpanded((current) => (current === id ? null : id)),
    [],
  )
  return (
    <SidePanel
      open={open}
      onClose={onClose}
      closeLabel={i18n.t('ui.funddataqualitypanel.closeFundDataDiagnostics')}
      size="wide"
      scroll="vertical"
    >
      <SidePanel.Title>
        {i18n.t('ui.funddataqualitypanel.fundDataDiagnostics')}
      </SidePanel.Title>
      <SidePanel.Description>
        {i18n.t(
          'ui.funddataqualitypanel.sortedByUnexplainedMonetaryImpactManualAndAgentSnapshots',
        )}
      </SidePanel.Description>
      <Surface variant="sectionEnd">
        <Inline
          as="div"
          flow="wrap"
          align="center"
          gap="default"
          inset="default"
        >
          <Layout as="span" flow="inline">
            <Text variant="captionLabel" tone="subtle">
              {i18n.t('ui.funddataqualitypanel.show')}
            </Text>
          </Layout>
          {FILTER_OPTIONS.map((option) => (
            <DiagnosticsFilterButton
              key={option}
              activeFilter={filter}
              onSelect={onSelect}
              option={option}
            />
          ))}
        </Inline>
      </Surface>
      <div>
        <Surface variant="compactFixedTable" as="table" align="left">
          <colgroup>
            <Layout as="col" />
            <Layout as="col" />
            <Layout as="col" />
            <Layout as="col" />
            <Layout as="col" />
            <Layout as="col" />
            <Layout as="col" />
            <Layout as="col" />
          </colgroup>
          <Surface as="thead" variant="sectionHeading" tone="subtle">
            <tr>
              <Inset as="th" inset="compact">
                {i18n.t('ui.funddataqualitypanel.fund')}
              </Inset>
              <Inset as="th" inset="compact">
                {i18n.t('ui.funddataqualitypanel.quality')}
              </Inset>
              <Inset as="th" inset="compact">
                {i18n.t('ui.funddataqualitypanel.sourceProxy')}
              </Inset>
              <Inset as="th" inset="compact">
                {i18n.t('ui.funddataqualitypanel.holdingsDate')}
              </Inset>
              <Inset as="th" inset="compact">
                <Text as="div" align="right">
                  {i18n.t('ui.funddataqualitypanel.explained')}
                </Text>
              </Inset>
              <Inset as="th" inset="compact">
                <Text as="div" align="right">
                  {i18n.t('ui.funddataqualitypanel.residual')}
                </Text>
              </Inset>
              <Inset as="th" inset="compact">
                {i18n.t('ui.funddataqualitypanel.diagnostic')}
              </Inset>
              <Inset as="th" inset="compact" />
            </tr>
          </Surface>
          <tbody>
            {rows.map((row) => (
              <FundDiagnosticsRow
                key={row.status.parentId}
                expanded={expanded}
                onToggle={toggleExpanded}
                row={row}
              />
            ))}
          </tbody>
        </Surface>
        {rows.length === 0 && (
          <Text as="p" variant="body" tone="subtle" align="center">
            <Layout as="span" flow="block" inset="spacious">
              {i18n.t('ui.funddataqualitypanel.noFundMatchesThisFilter')}
            </Layout>
          </Text>
        )}
      </div>
    </SidePanel>
  )
}

const FILTER_OPTIONS = [
  'issues',
  'all',
  'reliable',
  'partial',
  'unavailable',
] as const

function DiagnosticsFilterButton({
  activeFilter,
  onSelect,
  option,
}: {
  activeFilter: FundDiagnosticsFilter
  onSelect: (filter: FundDiagnosticsFilter) => void
  option: FundDiagnosticsFilter
}) {
  let label: string =
    FUND_QUALITY_LABELS[option as keyof typeof FUND_QUALITY_LABELS]
  if (option === 'issues') label = i18n.t('ui.funddataqualitypanel.issues')
  else if (option === 'all') label = i18n.t('ui.funddataqualitypanel.all')
  return (
    <Button
      type="button"
      onClick={() => onSelect(option)}
      variant="outlinedFilter"
      selected={activeFilter === option}
    >
      {label}
    </Button>
  )
}

function SnapshotSourceLink({ url }: { url: string }) {
  return (
    <Layout as="span" flow="inline">
      <ExternalLink href={url} variant="source" truncate>
        <Layout as="span" flow="block">
          {url}
        </Layout>
      </ExternalLink>
    </Layout>
  )
}

function SnapshotDetail({ snapshot }: { snapshot: FundSnapshot }) {
  const formatNumber = useFormatNumber()
  const formatPercentage = useFormatPercentage()
  return (
    <Layout spaceBefore="default">
      <Surface variant="sectionStart">
        <div>
          {snapshot.snapshotId} · {snapshot.status}
          {snapshot.isActive ? i18n.t('ui.funddataqualitypanel.active') : ''}
        </div>
        <div>
          {i18n.t('ui.funddataqualitypanel.snapshotMetrics', {
            coverage: formatPercentage(snapshot.coveragePct),
            rows: i18n.t('ui.funddataqualitypanel.rowCount', {
              count: snapshot.holdingCount,
              formattedCount: formatNumber(snapshot.holdingCount),
            }),
            age: i18n.t('ui.funddataqualitypanel.ageDays', {
              count: snapshot.ageDays,
            }),
          })}
        </div>
        {snapshot.notes && (
          <Layout spaceBefore="compact">
            <Text as="div" tone="muted">
              {snapshot.notes}
            </Text>
          </Layout>
        )}
        {snapshot.validationErrors && (
          <Layout spaceBefore="compact">
            <Text as="div" tone="negative">
              {snapshot.validationErrors}
            </Text>
          </Layout>
        )}
        {snapshot.sourceUrls.map((url) => (
          <SnapshotSourceLink key={url} url={url} />
        ))}
        {snapshot.evidencePath && (
          <Layout spaceBefore="compact">
            <Text as="div" variant="tinyCode" tone="subtle" wrap="anywhere">
              {i18n.t('ui.funddataqualitypanel.evidenceWithValues', {
                evidencePath: snapshot.evidencePath,
              })}
            </Text>
          </Layout>
        )}
      </Surface>
    </Layout>
  )
}

function UnresolvedDetail({ item }: { item: FundUnresolved }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (
    <Layout spaceAfter="default">
      <Surface variant="sectionEnd">
        <Text as="div" tone="secondary">
          {item.unresolvedName}
        </Text>
        <div>
          {formatPercentage(item.weight * 100)} ·{' '}
          {formatMoney(item.marketValue, { style: 'full' })}
        </div>
        <Text as="div" tone="warning">
          {item.reason}
        </Text>
        <Text as="div" variant="tinyCode" wrap="anywhere">
          {item.path}
        </Text>
      </Surface>
    </Layout>
  )
}

function ResolvedHoldingDetail({ holding }: { holding: FundHolding }) {
  const formatPercentage = useFormatPercentage()
  return (
    <Surface variant="sectionEnd">
      <Inline as="div" gap="default" inset="compact">
        <Layout as="span" flow="inline" sizing="flexible">
          <Text tone="secondary" truncate title={holding.lookthroughPath}>
            {holding.holdingName}
          </Text>
        </Layout>
        <Text tone="subtle" numeric>
          {formatPercentage(holding.weight * 100)}
        </Text>
      </Inline>
    </Surface>
  )
}

type DiagnosticsRow = ReturnType<typeof buildFundDiagnosticsRows>[number]

function FundDiagnosticsRow({
  expanded,
  onToggle,
  row,
}: {
  expanded: string | null
  onToggle: (id: string) => void
  row: DiagnosticsRow
}) {
  const formatDate = useFormatDate()
  const formatMoney = useFormatMoney()
  const formatNumber = useFormatNumber()
  const formatPercentage = useFormatPercentage()
  const { status } = row
  const isOpen = expanded === status.parentId

  return (
    <Fragment>
      <Surface as="tr" variant="topAlignedSection">
        <Inset as="td" inset="default">
          <Text as="div" wrap="words">
            <Text as="div" variant="medium" tone="secondary">
              {status.parentName}
            </Text>
            <Layout spaceBefore="compact">
              <Text as="div" variant="tinyCode" tone="subtle" wrap="anywhere">
                {status.parentIsin || status.parentTicker}
              </Text>
            </Layout>
          </Text>
        </Inset>
        <Inset as="td" inset="default">
          <FundQualityBadge status={status} />
          {status.manualAttention && (
            <Layout spaceBefore="default" width="content">
              <Surface variant="warningLabel" tone="warning">
                {status.sourceOrigin.startsWith('manual')
                  ? i18n.t('ui.funddataqualitypanel.snapshotManuel')
                  : i18n.t('ui.funddataqualitypanel.rechercheAgent')}
              </Surface>
            </Layout>
          )}
        </Inset>
        <FundDiagnosticSource status={status} />
        <Inset as="td" inset="default">
          <Text as="div" tone="muted">
            {formatDate(status.holdingsDate, {
              style: 'isoDate',
              fallback: i18n.t('ui.funddataqualitypanel.unknown'),
            })}
            <Layout spaceBefore="compact">
              <Text as="div" tone="subtle">
                {i18n.t('ui.funddataqualitypanel.refreshMetrics', {
                  rows: i18n.t('ui.funddataqualitypanel.rowCount', {
                    count: status.holdingCount,
                    formattedCount: formatNumber(status.holdingCount),
                  }),
                  refreshes: i18n.t('ui.funddataqualitypanel.refreshCount', {
                    count: status.refreshStreak,
                  }),
                })}
              </Text>
            </Layout>
          </Text>
        </Inset>
        <Inset as="td" inset="default">
          <Text as="div" tone="secondary" align="right" numeric>
            {formatPercentage(status.explainedPct)}
            <Layout spaceBefore="compact">
              <Text as="div" tone="subtle">
                {formatMoney(status.explainedValue, { style: 'full' })}
              </Text>
            </Layout>
          </Text>
        </Inset>
        <Inset as="td" inset="default">
          <Text as="div" tone="secondary" align="right" numeric>
            {formatPercentage(status.residualPct)}
            <Layout spaceBefore="compact">
              <Text as="div" tone="subtle">
                {formatMoney(status.residualValue, { style: 'full' })}
              </Text>
            </Layout>
          </Text>
        </Inset>
        <Inset as="td" inset="default">
          <Text
            as="div"
            wrap="words"
            tone={status.issues ? 'warning' : 'positive'}
          >
            {status.issues || i18n.t('ui.funddataqualitypanel.noDetectedIssue')}
          </Text>
        </Inset>
        <Inset as="td" inset="default">
          <Button
            type="button"
            onClick={() => onToggle(status.parentId)}
            variant="outlinedDetail"
          >
            {isOpen
              ? i18n.t('ui.funddataqualitypanel.close')
              : i18n.t('ui.funddataqualitypanel.details')}
          </Button>
        </Inset>
      </Surface>
      {isOpen && <FundDiagnosticDetails row={row} />}
    </Fragment>
  )
}

function FundDiagnosticSource({
  status,
}: {
  status: DiagnosticsRow['status']
}) {
  return (
    <Inset as="td" inset="default">
      <Text as="div" wrap="words">
        <ExternalLink href={status.sourceUrl} variant="source">
          {status.sourceName || i18n.t('ui.funddataqualitypanel.unavailable')}
        </ExternalLink>
        <Layout spaceBefore="compact">
          <Text as="div" tone="subtle">
            {status.proxyName
              ? i18n.t('ui.funddataqualitypanel.proxyExactValue0', {
                  value0: status.proxyName,
                })
              : fundQualitySourceLabel(status.qualityTier)}
          </Text>
        </Layout>
      </Text>
    </Inset>
  )
}
function FundDiagnosticDetails({ row }: { row: DiagnosticsRow }) {
  const { status, snapshots, holdings, unresolved } = row
  return (
    <Surface as="tr" variant="canvasFooter">
      <Inset colSpan={8} as="td" inset="default">
        <Grid columns={3} gap="relaxed">
          <DetailBlock
            title={i18n.t('ui.funddataqualitypanel.provenanceValidation')}
          >
            <div>
              {i18n.t('ui.funddataqualitypanel.state')}{' '}
              <Text tone="secondary">{status.decompositionState}</Text>
            </div>
            <div>
              {i18n.t('ui.funddataqualitypanel.snapshot')}{' '}
              <Text variant="code" tone="secondary">
                {status.snapshotId || i18n.t('ui.funddataqualitypanel.none')}
              </Text>
            </div>
            <div>
              {i18n.t('ui.funddataqualitypanel.checksum')}{' '}
              <Text variant="tinyCode" tone="muted" wrap="anywhere">
                {status.checksumSha256 ||
                  i18n.t('ui.funddataqualitypanel.notRecorded')}
              </Text>
            </div>
            {snapshots.map((snapshot) => (
              <SnapshotDetail key={snapshot.snapshotId} snapshot={snapshot} />
            ))}
          </DetailBlock>
          <DetailBlock
            title={i18n.t('ui.funddataqualitypanel.unresolvedResearchQueue')}
          >
            {unresolved.length === 0 ? (
              <Text as="div" tone="positive">
                {i18n.t('ui.funddataqualitypanel.noUnresolvedBranch')}
              </Text>
            ) : (
              unresolved.map((item) => (
                <UnresolvedDetail key={item.path} item={item} />
              ))
            )}
          </DetailBlock>
          <DetailBlock
            title={i18n.t('ui.funddataqualitypanel.resolvedHoldingsValue0', {
              value0: holdings.length,
            })}
          >
            {holdings.slice(0, 20).map((holding) => (
              <ResolvedHoldingDetail
                key={holding.lookthroughPath}
                holding={holding}
              />
            ))}
            {holdings.length > 20 && (
              <Layout spaceBefore="default">
                {i18n.t('ui.funddataqualitypanel.additionalHoldings', {
                  count: holdings.length - 20,
                })}
              </Layout>
            )}
          </DetailBlock>
        </Grid>
      </Inset>
    </Surface>
  )
}

function DetailBlock({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Surface as="section" variant="smallCard" tone="subtle">
      <Layout spaceAfter="default">
        <Text as="h3" variant="strong" tone="secondary">
          {title}
        </Text>
      </Layout>
      {children}
    </Surface>
  )
}
