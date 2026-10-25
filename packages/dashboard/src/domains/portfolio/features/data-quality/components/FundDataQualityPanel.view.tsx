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
import { ExternalLink } from '@/shared/ui/ExternalLink.view'
import { SidePanel } from '@/shared/ui/SidePanel.view'

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
    <button
      type="button"
      onClick={() => onSelect(option)}
      className={`rounded-lg border px-2.5 py-1 text-xs ${activeFilter === option ? 'border-accent bg-accent-muted/50 text-accent' : 'border-border-strong text-content-subtle hover:text-content-secondary'}`}
    >
      {label}
    </button>
  )
}

function SnapshotSourceLink({ url }: { url: string }) {
  return (
    <ExternalLink
      href={url}
      className="mr-2 block truncate text-accent hover:underline"
    >
      {url}
    </ExternalLink>
  )
}

function SnapshotDetail({ snapshot }: { snapshot: FundSnapshot }) {
  const formatNumber = useFormatNumber()
  const formatPercentage = useFormatPercentage()
  return (
    <div className="mt-2 border-t border-border pt-2">
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
        <div className="mt-1 text-content-muted">{snapshot.notes}</div>
      )}
      {snapshot.validationErrors && (
        <div className="mt-1 text-danger">{snapshot.validationErrors}</div>
      )}
      {snapshot.sourceUrls.map((url) => (
        <SnapshotSourceLink key={url} url={url} />
      ))}
      {snapshot.evidencePath && (
        <div className="mt-1 break-all font-mono text-[10px] text-content-subtle">
          {i18n.t('ui.funddataqualitypanel.evidenceWithValues', {
            evidencePath: snapshot.evidencePath,
          })}
        </div>
      )}
    </div>
  )
}

function UnresolvedDetail({ item }: { item: FundUnresolved }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (
    <div className="mb-2 border-b border-border pb-2">
      <div className="text-content-secondary">{item.unresolvedName}</div>
      <div>
        {formatPercentage(item.weight * 100)} ·{' '}
        {formatMoney(item.marketValue, { style: 'full' })}
      </div>
      <div className="text-warning">{item.reason}</div>
      <div className="break-all font-mono text-[10px]">{item.path}</div>
    </div>
  )
}

function ResolvedHoldingDetail({ holding }: { holding: FundHolding }) {
  const formatPercentage = useFormatPercentage()
  return (
    <div className="flex gap-2 border-b border-border py-1">
      <span
        className="min-w-0 flex-1 truncate text-content-secondary"
        title={holding.lookthroughPath}
      >
        {holding.holdingName}
      </span>
      <span className="tabular-nums text-content-subtle">
        {formatPercentage(holding.weight * 100)}
      </span>
    </div>
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
      <tr className="border-t border-border align-top">
        <td className="break-words px-4 py-3">
          <div className="font-medium text-content-secondary">
            {status.parentName}
          </div>
          <div className="mt-1 break-all font-mono text-[10px] text-content-subtle">
            {status.parentIsin || status.parentTicker}
          </div>
        </td>
        <td className="px-4 py-3">
          <FundQualityBadge status={status} />
          {status.manualAttention && (
            <div className="mt-2 w-fit rounded border border-warning/70 bg-warning-muted/40 px-2 py-1 text-[10px] font-semibold text-warning">
              {status.sourceOrigin.startsWith('manual')
                ? i18n.t('ui.funddataqualitypanel.snapshotManuel')
                : i18n.t('ui.funddataqualitypanel.rechercheAgent')}
            </div>
          )}
        </td>
        <td className="break-words px-4 py-3">
          <ExternalLink
            href={status.sourceUrl}
            className="text-accent hover:underline"
          >
            {status.sourceName || i18n.t('ui.funddataqualitypanel.unavailable')}
          </ExternalLink>
          <div className="mt-1 text-content-subtle">
            {status.proxyName
              ? i18n.t('ui.funddataqualitypanel.proxyExactValue0', {
                  value0: status.proxyName,
                })
              : fundQualitySourceLabel(status.qualityTier)}
          </div>
        </td>
        <td className="px-4 py-3 text-content-muted">
          {status.holdingsDate
            ? formatDate(status.holdingsDate, { style: 'isoDate' })
            : i18n.t('ui.funddataqualitypanel.unknown')}
          <div className="mt-1 text-content-subtle">
            {i18n.t('ui.funddataqualitypanel.refreshMetrics', {
              rows: i18n.t('ui.funddataqualitypanel.rowCount', {
                count: status.holdingCount,
                formattedCount: formatNumber(status.holdingCount),
              }),
              refreshes: i18n.t('ui.funddataqualitypanel.refreshCount', {
                count: status.refreshStreak,
              }),
            })}
          </div>
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-content-secondary">
          {formatPercentage(status.explainedPct)}
          <div className="mt-1 text-content-subtle">
            {formatMoney(status.explainedValue, { style: 'full' })}
          </div>
        </td>
        <td className="px-4 py-3 text-right tabular-nums text-content-secondary">
          {formatPercentage(status.residualPct)}
          <div className="mt-1 text-content-subtle">
            {formatMoney(status.residualValue, { style: 'full' })}
          </div>
        </td>
        <td
          className={`break-words px-4 py-3 ${status.issues ? 'text-warning' : 'text-positive'}`}
        >
          {status.issues || i18n.t('ui.funddataqualitypanel.noDetectedIssue')}
        </td>
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={() => onToggle(status.parentId)}
            className="rounded border border-border-strong px-2 py-1 text-content-secondary hover:border-border-strong"
          >
            {isOpen
              ? i18n.t('ui.funddataqualitypanel.close')
              : i18n.t('ui.funddataqualitypanel.details')}
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr className="border-t border-border bg-canvas/50">
          <td colSpan={8} className="p-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <DetailBlock
                title={i18n.t('ui.funddataqualitypanel.provenanceValidation')}
              >
                <div>
                  {i18n.t('ui.funddataqualitypanel.state')}{' '}
                  <span className="text-content-secondary">
                    {status.decompositionState}
                  </span>
                </div>
                <div>
                  {i18n.t('ui.funddataqualitypanel.snapshot')}{' '}
                  <span className="font-mono text-content-secondary">
                    {status.snapshotId ||
                      i18n.t('ui.funddataqualitypanel.none')}
                  </span>
                </div>
                <div>
                  {i18n.t('ui.funddataqualitypanel.checksum')}{' '}
                  <span className="break-all font-mono text-[10px] text-content-muted">
                    {status.checksumSha256 ||
                      i18n.t('ui.funddataqualitypanel.notRecorded')}
                  </span>
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
                  <div className="text-positive">
                    {i18n.t('ui.funddataqualitypanel.noUnresolvedBranch')}
                  </div>
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
        </tr>
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
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <span className="mr-1 text-xs font-medium text-content-subtle">
          {i18n.t('ui.funddataqualitypanel.show')}
        </span>
        {FILTER_OPTIONS.map((option) => (
          <DiagnosticsFilterButton
            key={option}
            activeFilter={filter}
            onSelect={onSelect}
            option={option}
          />
        ))}
      </div>
      <div>
        <table className="w-full table-fixed text-left text-xs">
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
          <thead className="sticky top-0 z-10 bg-surface-raised uppercase tracking-wider text-content-subtle">
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
              <th className="px-4 py-2 text-right">
                {i18n.t('ui.funddataqualitypanel.explained')}
              </th>
              <th className="px-4 py-2 text-right">
                {i18n.t('ui.funddataqualitypanel.residual')}
              </th>
              <th className="px-4 py-2">
                {i18n.t('ui.funddataqualitypanel.diagnostic')}
              </th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
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
        </table>
        {rows.length === 0 && (
          <p className="p-6 text-center text-sm text-content-subtle">
            {i18n.t('ui.funddataqualitypanel.noFundMatchesThisFilter')}
          </p>
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
    <section className="rounded-lg border border-border bg-surface p-3 text-xs text-content-subtle">
      <h3 className="mb-2 font-semibold text-content-secondary">{title}</h3>
      {children}
    </section>
  )
}
