import type { ReactNode } from 'react'
import { Fragment, useCallback, useState } from 'react'

import type {
  buildFundDiagnosticsRows,
  FundDiagnosticsFilter,
} from '@/domains/portfolio/shared/helpers/mappers/buildFundDiagnosticsRows'
import { FUND_QUALITY_LABELS } from '@/domains/portfolio/shared/helpers/presenters/getFundQualityPresentation'
import { getFundQualitySourceLabel as fundQualitySourceLabel } from '@/domains/portfolio/shared/helpers/presenters/getFundQualitySourceLabel'
import type {
  FundHolding,
  FundSnapshot,
  FundUnresolved,
} from '@/domains/portfolio/shared/types/fundHolding.type'
import i18n from '@/i18n/i18n'
import { useFormatDate } from '@/shared/helpers/formatters/useFormatDate'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { Button } from '@/shared/ui/Controls.view'
import { ExternalLink } from '@/shared/ui/ExternalLink.view'
import { SidePanel } from '@/shared/ui/SidePanel.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { FundQualityBadge } from './FundQualityBadge.view'

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
      variant="qualityFilter"
      selected={activeFilter === option}
      className="px-2.5 py-1"
    >
      {label}
    </Button>
  )
}

function SnapshotSourceLink({ url }: { url: string }) {
  return (
    <ExternalLink href={url} variant="source" truncate className="mr-2 block">
      {url}
    </ExternalLink>
  )
}

function SnapshotDetail({ snapshot }: { snapshot: FundSnapshot }) {
  const formatNumber = useFormatNumber()
  const formatPercentage = useFormatPercentage()
  return (
    <Surface variant="sectionStart" className="mt-2 pt-2">
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
        <Text as="div" tone="muted" className="mt-1">
          {snapshot.notes}
        </Text>
      )}
      {snapshot.validationErrors && (
        <Text as="div" tone="negative" className="mt-1">
          {snapshot.validationErrors}
        </Text>
      )}
      {snapshot.sourceUrls.map((url) => (
        <SnapshotSourceLink key={url} url={url} />
      ))}
      {snapshot.evidencePath && (
        <Text
          as="div"
          variant="tinyCode"
          tone="subtle"
          wrap="anywhere"
          className="mt-1"
        >
          {i18n.t('ui.funddataqualitypanel.evidenceWithValues', {
            evidencePath: snapshot.evidencePath,
          })}
        </Text>
      )}
    </Surface>
  )
}

function UnresolvedDetail({ item }: { item: FundUnresolved }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (
    <Surface variant="sectionEnd" className="mb-2 pb-2">
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
  )
}

function ResolvedHoldingDetail({ holding }: { holding: FundHolding }) {
  const formatPercentage = useFormatPercentage()
  return (
    <Surface variant="sectionEnd" className="flex gap-2 py-1">
      <Text
        tone="secondary"
        truncate
        className="min-w-0 flex-1"
        title={holding.lookthroughPath}
      >
        {holding.holdingName}
      </Text>
      <Text tone="subtle" numeric>
        {formatPercentage(holding.weight * 100)}
      </Text>
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
  const { holdings, snapshots, status, unresolved } = row
  const isOpen = expanded === status.parentId

  return (
    <Fragment>
      <Surface as="tr" variant="topAlignedSection">
        <Text as="td" wrap="words" className="px-4 py-3">
          <Text as="div" variant="medium" tone="secondary">
            {status.parentName}
          </Text>
          <Text
            as="div"
            variant="tinyCode"
            tone="subtle"
            wrap="anywhere"
            className="mt-1"
          >
            {status.parentIsin || status.parentTicker}
          </Text>
        </Text>
        <td className="px-4 py-3">
          <FundQualityBadge status={status} />
          {status.manualAttention && (
            <Surface
              variant="warningLabel"
              tone="warning"
              className="mt-2 w-fit px-2 py-1"
            >
              {status.sourceOrigin.startsWith('manual')
                ? i18n.t('ui.funddataqualitypanel.snapshotManuel')
                : i18n.t('ui.funddataqualitypanel.rechercheAgent')}
            </Surface>
          )}
        </td>
        <Text as="td" wrap="words" className="px-4 py-3">
          <ExternalLink href={status.sourceUrl} variant="source">
            {status.sourceName || i18n.t('ui.funddataqualitypanel.unavailable')}
          </ExternalLink>
          <Text as="div" tone="subtle" className="mt-1">
            {status.proxyName
              ? i18n.t('ui.funddataqualitypanel.proxyExactValue0', {
                  value0: status.proxyName,
                })
              : fundQualitySourceLabel(status.qualityTier)}
          </Text>
        </Text>
        <Text as="td" tone="muted" className="px-4 py-3">
          {status.holdingsDate
            ? formatDate(status.holdingsDate, { style: 'isoDate' })
            : i18n.t('ui.funddataqualitypanel.unknown')}
          <Text as="div" tone="subtle" className="mt-1">
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
        </Text>
        <Text
          as="td"
          tone="secondary"
          align="right"
          numeric
          className="px-4 py-3"
        >
          {formatPercentage(status.explainedPct)}
          <Text as="div" tone="subtle" className="mt-1">
            {formatMoney(status.explainedValue, { style: 'full' })}
          </Text>
        </Text>
        <Text
          as="td"
          tone="secondary"
          align="right"
          numeric
          className="px-4 py-3"
        >
          {formatPercentage(status.residualPct)}
          <Text as="div" tone="subtle" className="mt-1">
            {formatMoney(status.residualValue, { style: 'full' })}
          </Text>
        </Text>
        <Text
          as="td"
          wrap="words"
          tone={status.issues ? 'warning' : 'positive'}
          className="px-4 py-3"
        >
          {status.issues || i18n.t('ui.funddataqualitypanel.noDetectedIssue')}
        </Text>
        <td className="px-4 py-3">
          <Button
            type="button"
            onClick={() => onToggle(status.parentId)}
            variant="fundDetail"
            className="px-2 py-1"
          >
            {isOpen
              ? i18n.t('ui.funddataqualitypanel.close')
              : i18n.t('ui.funddataqualitypanel.details')}
          </Button>
        </td>
      </Surface>
      {isOpen && (
        <Surface as="tr" variant="canvasFooter">
          <td colSpan={8} className="p-4">
            <div className="grid gap-4 lg:grid-cols-3">
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
                    {status.snapshotId ||
                      i18n.t('ui.funddataqualitypanel.none')}
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
                  <SnapshotDetail
                    key={snapshot.snapshotId}
                    snapshot={snapshot}
                  />
                ))}
              </DetailBlock>
              <DetailBlock
                title={i18n.t(
                  'ui.funddataqualitypanel.unresolvedResearchQueue',
                )}
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
                title={i18n.t(
                  'ui.funddataqualitypanel.resolvedHoldingsValue0',
                  {
                    value0: holdings.length,
                  },
                )}
              >
                {holdings.slice(0, 20).map((holding) => (
                  <ResolvedHoldingDetail
                    key={holding.lookthroughPath}
                    holding={holding}
                  />
                ))}
                {holdings.length > 20 && (
                  <div className="mt-2">
                    {i18n.t('ui.funddataqualitypanel.additionalHoldings', {
                      count: holdings.length - 20,
                    })}
                  </div>
                )}
              </DetailBlock>
            </div>
          </td>
        </Surface>
      )}
    </Fragment>
  )
}

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
      bodyClassName="overflow-y-auto overflow-x-hidden"
    >
      <SidePanel.Title>
        {i18n.t('ui.funddataqualitypanel.fundDataDiagnostics')}
      </SidePanel.Title>
      <SidePanel.Description>
        {i18n.t(
          'ui.funddataqualitypanel.sortedByUnexplainedMonetaryImpactManualAndAgentSnapshots',
        )}
      </SidePanel.Description>
      <Surface
        variant="sectionEnd"
        className="flex flex-wrap items-center gap-2 px-4 py-3"
      >
        <Text variant="captionLabel" tone="subtle" className="mr-1">
          {i18n.t('ui.funddataqualitypanel.show')}
        </Text>
        {FILTER_OPTIONS.map((option) => (
          <DiagnosticsFilterButton
            key={option}
            activeFilter={filter}
            onSelect={onSelect}
            option={option}
          />
        ))}
      </Surface>
      <div>
        <Surface
          variant="compactTable"
          as="table"
          align="left"
          className="w-full table-fixed"
        >
          <colgroup>
            <col className="w-[16%]" />
            <col className="w-[10%]" />
            <col className="w-[15%]" />
            <col className="w-[13%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[21%]" />
            <col className="w-[7%]" />
          </colgroup>
          <Surface
            as="thead"
            variant="sectionHeading"
            tone="subtle"
            className="sticky top-0 z-10"
          >
            <tr>
              <th className="px-4 py-2">
                {i18n.t('ui.funddataqualitypanel.fund')}
              </th>
              <th className="px-4 py-2">
                {i18n.t('ui.funddataqualitypanel.quality')}
              </th>
              <th className="px-4 py-2">
                {i18n.t('ui.funddataqualitypanel.sourceProxy')}
              </th>
              <th className="px-4 py-2">
                {i18n.t('ui.funddataqualitypanel.holdingsDate')}
              </th>
              <Text as="th" align="right" className="px-4 py-2">
                {i18n.t('ui.funddataqualitypanel.explained')}
              </Text>
              <Text as="th" align="right" className="px-4 py-2">
                {i18n.t('ui.funddataqualitypanel.residual')}
              </Text>
              <th className="px-4 py-2">
                {i18n.t('ui.funddataqualitypanel.diagnostic')}
              </th>
              <th className="px-4 py-2" />
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
          <Text
            as="p"
            variant="body"
            tone="subtle"
            align="center"
            className="p-6"
          >
            {i18n.t('ui.funddataqualitypanel.noFundMatchesThisFilter')}
          </Text>
        )}
      </div>
    </SidePanel>
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
    <Surface as="section" variant="smallCard" tone="subtle" className="p-3">
      <Text as="h3" variant="strong" tone="secondary" className="mb-2">
        {title}
      </Text>
      {children}
    </Surface>
  )
}
