import i18n from '@/i18n/i18n'
import { Fragment, useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  FundHolding,
  FundHoldingStatus,
  FundSnapshot,
  FundUnresolved,
} from '@/domains/portfolio/shared/apis/queries/useFundHoldings'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { SidePanel } from '@/shared/ui/SidePanel.view'
import { FundQualityBadge } from './FundQualityBadge.view'
import {
  FUND_QUALITY_LABELS,
} from '@/domains/portfolio/shared/helpers/presenters/getFundQualityPresentation'
import { getFundQualitySourceLabel as fundQualitySourceLabel } from '@/domains/portfolio/shared/helpers/presenters/getFundQualitySourceLabel'
import {
  buildFundDiagnosticsRows,
  type FundDiagnosticsFilter,
} from '@/domains/portfolio/shared/helpers/mappers/buildFundDiagnosticsRows'
import { useDataQualityFundDiagnostics } from '@/domains/portfolio/features/data-quality/services/actions/useDataQualityFundDiagnostics'

interface Props {
  statuses: FundHoldingStatus[]
  holdings: FundHolding[]
  snapshots: FundSnapshot[]
  unresolved: FundUnresolved[]
}

const FILTER_OPTIONS = ['issues', 'all', 'reliable', 'partial', 'unavailable'] as const

function DiagnosticsFilterButton({ activeFilter, onSelect, option }: { activeFilter: FundDiagnosticsFilter; onSelect: (filter: FundDiagnosticsFilter) => void; option: FundDiagnosticsFilter }) {
  let label: string = FUND_QUALITY_LABELS[option as keyof typeof FUND_QUALITY_LABELS]
  if (option === 'issues') label = i18n.t('ui.funddataqualitypanel.issues')
  else if (option === 'all') label = i18n.t('ui.funddataqualitypanel.all')
  return <button type="button" onClick={() => onSelect(option)} className={`rounded-lg border px-2.5 py-1 text-xs ${activeFilter === option ? 'border-blue-600 bg-blue-950/50 text-blue-200' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}>{label}</button>
}

function SnapshotSourceLink({ url }: { url: string }) {
  return <a href={url} target="_blank" rel="noopener noreferrer" className="mr-2 block truncate text-blue-400 hover:underline">{url}</a>
}

function SnapshotDetail({ snapshot }: { snapshot: FundSnapshot }) {
  const formatPercentage = useFormatPercentage()
  return <div className="mt-2 border-t border-gray-800 pt-2"><div>{snapshot.snapshotId} · {snapshot.status}{snapshot.isActive ? i18n.t('ui.funddataqualitypanel.active') : ''}</div><div>{formatPercentage(snapshot.coveragePct)} · {snapshot.holdingCount}  {i18n.t('ui.funddataqualitypanel.rows')} {snapshot.ageDays}  {i18n.t('ui.funddataqualitypanel.days')}</div>{snapshot.notes && <div className="mt-1 text-gray-400">{snapshot.notes}</div>}{snapshot.validationErrors && <div className="mt-1 text-red-300">{snapshot.validationErrors}</div>}{snapshot.sourceUrls.map((url) => <SnapshotSourceLink key={url} url={url} />)}{snapshot.evidencePath && <div className="mt-1 break-all font-mono text-[10px] text-gray-600">{i18n.t('ui.funddataqualitypanel.evidence')} {snapshot.evidencePath}</div>}</div>
}

function UnresolvedDetail({ item }: { item: FundUnresolved }) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return <div className="mb-2 border-b border-gray-800 pb-2"><div className="text-gray-200">{item.unresolvedName}</div><div>{formatPercentage(item.weight * 100)} · {formatMoney(item.marketValue, { style: 'full' })}</div><div className="text-amber-300">{item.reason}</div><div className="break-all font-mono text-[10px]">{item.path}</div></div>
}

function ResolvedHoldingDetail({ holding }: { holding: FundHolding }) {
  const formatPercentage = useFormatPercentage()
  return <div className="flex gap-2 border-b border-gray-800 py-1"><span className="min-w-0 flex-1 truncate text-gray-300" title={holding.lookthroughPath}>{holding.holdingName}</span><span className="tabular-nums text-gray-500">{formatPercentage(holding.weight * 100)}</span></div>
}

type DiagnosticsRow = ReturnType<typeof buildFundDiagnosticsRows>[number]

function FundDiagnosticsRow({ expanded, onToggle, row }: { expanded: string | null; onToggle: (id: string) => void; row: DiagnosticsRow }) {
  const formatMoney = useFormatMoney()
  const formatNumber = useFormatNumber()
  const formatPercentage = useFormatPercentage()
  const { holdings, snapshots, status, unresolved } = row
  const isOpen = expanded === status.parentId
  return <Fragment><tr className="border-t border-gray-800 align-top"><td className="break-words px-4 py-3"><div className="font-medium text-gray-200">{status.parentName}</div><div className="mt-1 break-all font-mono text-[10px] text-gray-600">{status.parentIsin || status.parentTicker}</div></td><td className="px-4 py-3"><FundQualityBadge status={status} />{status.manualAttention && <div className="mt-2 w-fit rounded border border-amber-700/70 bg-amber-950/40 px-2 py-1 text-[10px] font-semibold text-amber-300">{status.sourceOrigin.startsWith('manual') ? i18n.t('ui.funddataqualitypanel.snapshotManuel') : i18n.t('ui.funddataqualitypanel.rechercheAgent')}</div>}</td><td className="break-words px-4 py-3"><a href={status.sourceUrl || undefined} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{status.sourceName || i18n.t('ui.funddataqualitypanel.unavailable')}</a><div className="mt-1 text-gray-600">{status.proxyName ? i18n.t('ui.funddataqualitypanel.proxyExactValue0', { value0: status.proxyName }) : fundQualitySourceLabel(status.qualityTier)}</div></td><td className="px-4 py-3 text-gray-400">{status.holdingsDate || i18n.t('ui.funddataqualitypanel.unknown')}<div className="mt-1 text-gray-600">{formatNumber(status.holdingCount)}  {i18n.t('ui.funddataqualitypanel.rows')} {status.refreshStreak}  {i18n.t('ui.funddataqualitypanel.successfulRefreshes')}</div></td><td className="px-4 py-3 text-right tabular-nums text-gray-300">{formatPercentage(status.explainedPct)}<div className="mt-1 text-gray-600">{formatMoney(status.explainedValue, { style: 'full' })}</div></td><td className="px-4 py-3 text-right tabular-nums text-gray-300">{formatPercentage(status.residualPct)}<div className="mt-1 text-gray-600">{formatMoney(status.residualValue, { style: 'full' })}</div></td><td className={`break-words px-4 py-3 ${status.issues ? 'text-amber-300' : 'text-emerald-400'}`}>{status.issues || i18n.t('ui.funddataqualitypanel.noDetectedIssue')}</td><td className="px-4 py-3"><button type="button" onClick={() => onToggle(status.parentId)} className="rounded border border-gray-700 px-2 py-1 text-gray-300 hover:border-gray-500">{isOpen ? i18n.t('ui.funddataqualitypanel.close') : i18n.t('ui.funddataqualitypanel.details')}</button></td></tr>{isOpen && <tr className="border-t border-gray-800 bg-gray-950/50"><td colSpan={8} className="p-4"><div className="grid gap-4 lg:grid-cols-3"><DetailBlock title={i18n.t('ui.funddataqualitypanel.provenanceValidation')}><div>{i18n.t('ui.funddataqualitypanel.state')} <span className="text-gray-200">{status.decompositionState}</span></div><div>{i18n.t('ui.funddataqualitypanel.snapshot')} <span className="font-mono text-gray-300">{status.snapshotId || i18n.t('ui.funddataqualitypanel.none')}</span></div><div>{i18n.t('ui.funddataqualitypanel.checksum')} <span className="break-all font-mono text-[10px] text-gray-400">{status.checksumSha256 || i18n.t('ui.funddataqualitypanel.notRecorded')}</span></div>{snapshots.map((snapshot) => <SnapshotDetail key={snapshot.snapshotId} snapshot={snapshot} />)}</DetailBlock><DetailBlock title={i18n.t('ui.funddataqualitypanel.unresolvedResearchQueue')}>{unresolved.length === 0 ? <div className="text-emerald-400">{i18n.t('ui.funddataqualitypanel.noUnresolvedBranch')}</div> : unresolved.map((item) => <UnresolvedDetail key={item.path} item={item} />)}</DetailBlock><DetailBlock title={i18n.t('ui.funddataqualitypanel.resolvedHoldingsValue0', { value0: holdings.length })}>{holdings.slice(0, 20).map((holding) => <ResolvedHoldingDetail key={holding.lookthroughPath} holding={holding} />)}{holdings.length > 20 && <div className="mt-2">+ {holdings.length - 20}  {i18n.t('ui.funddataqualitypanel.moreRows')}</div>}</DetailBlock></div></td></tr>}</Fragment>
}

export function FundDataQualityPanel({ statuses, holdings, snapshots, unresolved }: Props) {
  const { closeFundDiagnostics } = useDataQualityFundDiagnostics()
  const [filter, setFilter] = useState<FundDiagnosticsFilter>('issues')
  const [expanded, setExpanded] = useState<string | null>(null)
  const rows = useMemo(
    () => buildFundDiagnosticsRows({ filter, holdings, snapshots, statuses, unresolved }),
    [filter, holdings, snapshots, statuses, unresolved],
  )
  const toggleExpanded = useCallback((id: string) => setExpanded((current) => current === id ? null : id), [])

  return (
    <SidePanel
      title={i18n.t('ui.funddataqualitypanel.fundDataDiagnostics')}
      description={i18n.t('ui.funddataqualitypanel.sortedByUnexplainedMonetaryImpactManualAndAgentSnapshots')}
      onClose={closeFundDiagnostics}
      closeLabel={i18n.t('ui.funddataqualitypanel.closeFundDataDiagnostics')}
      size="wide"
      bodyClassName="overflow-y-auto overflow-x-hidden"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 px-4 py-3">
        <span className="mr-1 text-xs font-medium text-gray-500">{i18n.t('ui.funddataqualitypanel.show')}</span>
        {FILTER_OPTIONS.map((option) => <DiagnosticsFilterButton key={option} activeFilter={filter} onSelect={setFilter} option={option} />)}
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
          <thead className="sticky top-0 z-10 bg-gray-800 uppercase tracking-wider text-gray-500"><tr><th className="px-4 py-2">{i18n.t('ui.funddataqualitypanel.fund')}</th><th className="px-4 py-2">{i18n.t('ui.funddataqualitypanel.quality')}</th><th className="px-4 py-2">{i18n.t('ui.funddataqualitypanel.sourceProxy')}</th><th className="px-4 py-2">{i18n.t('ui.funddataqualitypanel.holdingsDate')}</th><th className="px-4 py-2 text-right">{i18n.t('ui.funddataqualitypanel.explained')}</th><th className="px-4 py-2 text-right">{i18n.t('ui.funddataqualitypanel.residual')}</th><th className="px-4 py-2">{i18n.t('ui.funddataqualitypanel.diagnostic')}</th><th className="px-4 py-2" /></tr></thead>
          <tbody>
            {rows.map((row) => <FundDiagnosticsRow key={row.status.parentId} expanded={expanded} onToggle={toggleExpanded} row={row} />)}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-sm text-gray-500">{i18n.t('ui.funddataqualitypanel.noFundMatchesThisFilter')}</p>}
      </div>
    </SidePanel>
  )
}

function DetailBlock({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-lg border border-gray-800 bg-gray-900 p-3 text-xs text-gray-500"><h3 className="mb-2 font-semibold text-gray-200">{title}</h3>{children}</section>
}
