import { Fragment, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type {
  FundHolding,
  FundHoldingStatus,
  FundSnapshot,
  FundUnresolved,
} from '@/hooks/useFundHoldings'
import { fmtFull } from '@/shared/format/money'
import { formatPercentage } from '@/shared/format/percentage'
import { SidePanel } from '@/shared/ui/SidePanel'
import { FundQualityBadge } from './FundQualityBadge'
import {
  FUND_QUALITY_LABELS,
  fundQualityCategory,
  fundQualitySourceLabel,
  type FundQualityCategory,
} from './fundHoldings.logic'
import { hasMaterialQualityGap } from '@/shared/quality/qualityThresholds'

interface Props {
  statuses: FundHoldingStatus[]
  holdings: FundHolding[]
  snapshots: FundSnapshot[]
  unresolved: FundUnresolved[]
  onClose: () => void
}

export function FundDataQualityPanel({ statuses, holdings, snapshots, unresolved, onClose }: Props) {
  const [filter, setFilter] = useState<'all' | 'issues' | FundQualityCategory>('issues')
  const [expanded, setExpanded] = useState<string | null>(null)
  const rows = useMemo(() => statuses
    .filter((status) => filter === 'all'
      || filter === fundQualityCategory(status.qualityTier)
      || (filter === 'issues' && (status.validationStatus !== 'ok' || hasMaterialQualityGap(status.residualPct))))
    .sort((a, b) => b.residualValue - a.residualValue || b.marketValue - a.marketValue), [statuses, filter])

  return (
    <SidePanel
      title="Fund data diagnostics"
      description="Sorted by unexplained monetary impact. Manual and agent snapshots always require attention."
      onClose={onClose}
      closeLabel="Close fund data diagnostics"
      size="wide"
      bodyClassName="overflow-y-auto overflow-x-hidden"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 px-4 py-3">
        <span className="mr-1 text-xs font-medium text-gray-500">Show</span>
        {(['issues', 'all', 'reliable', 'partial', 'unavailable'] as const).map((option) => (
          <button key={option} type="button" onClick={() => setFilter(option)} className={`rounded-lg border px-2.5 py-1 text-xs ${filter === option ? 'border-blue-600 bg-blue-950/50 text-blue-200' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}>{option === 'issues' ? 'Issues' : option === 'all' ? 'All' : FUND_QUALITY_LABELS[option]}</button>
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
          <thead className="sticky top-0 z-10 bg-gray-800 uppercase tracking-wider text-gray-500"><tr><th className="px-4 py-2">Fund</th><th className="px-4 py-2">Quality</th><th className="px-4 py-2">Source / proxy</th><th className="px-4 py-2">Holdings date</th><th className="px-4 py-2 text-right">Explained</th><th className="px-4 py-2 text-right">Residual</th><th className="px-4 py-2">Diagnostic</th><th className="px-4 py-2" /></tr></thead>
          <tbody>
            {rows.map((status) => {
              const isOpen = expanded === status.parentId
              const fundHoldings = holdings.filter((item) => (item.parentIsin || item.parentTicker || item.parentName) === status.parentId)
              const fundSnapshots = snapshots.filter((item) => item.fundId === status.parentId)
              const fundUnresolved = unresolved.filter((item) => item.parentId === status.parentId)
              return <Fragment key={status.parentId}>
                <tr className="border-t border-gray-800 align-top">
                  <td className="break-words px-4 py-3"><div className="font-medium text-gray-200">{status.parentName}</div><div className="mt-1 break-all font-mono text-[10px] text-gray-600">{status.parentIsin || status.parentTicker}</div></td>
                  <td className="px-4 py-3"><FundQualityBadge status={status} />{status.manualAttention && <div className="mt-2 w-fit rounded border border-amber-700/70 bg-amber-950/40 px-2 py-1 text-[10px] font-semibold text-amber-300">{status.sourceOrigin.startsWith('manual') ? 'Snapshot manuel' : 'Recherche agent'}</div>}</td>
                  <td className="break-words px-4 py-3"><a href={status.sourceUrl || undefined} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{status.sourceName || 'Unavailable'}</a><div className="mt-1 text-gray-600">{status.proxyName ? `Proxy exact : ${status.proxyName}` : fundQualitySourceLabel(status.qualityTier)}</div></td>
                  <td className="px-4 py-3 text-gray-400">{status.holdingsDate || 'Unknown'}<div className="mt-1 text-gray-600">{status.holdingCount.toLocaleString()} rows · {status.refreshStreak} successful refreshes</div></td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-300">{formatPercentage(status.explainedPct)}%<div className="mt-1 text-gray-600">{fmtFull(status.explainedValue)}</div></td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-300">{formatPercentage(status.residualPct)}%<div className="mt-1 text-gray-600">{fmtFull(status.residualValue)}</div></td>
                  <td className={`break-words px-4 py-3 ${status.issues ? 'text-amber-300' : 'text-emerald-400'}`}>{status.issues || 'No detected issue'}</td>
                  <td className="px-4 py-3"><button type="button" onClick={() => setExpanded(isOpen ? null : status.parentId)} className="rounded border border-gray-700 px-2 py-1 text-gray-300 hover:border-gray-500">{isOpen ? 'Close' : 'Details'}</button></td>
                </tr>
                {isOpen && <tr className="border-t border-gray-800 bg-gray-950/50"><td colSpan={8} className="p-4">
                  <div className="grid gap-4 lg:grid-cols-3">
                    <DetailBlock title="Provenance & validation">
                      <div>State: <span className="text-gray-200">{status.decompositionState}</span></div>
                      <div>Snapshot: <span className="font-mono text-gray-300">{status.snapshotId || 'none'}</span></div>
                      <div>Checksum: <span className="break-all font-mono text-[10px] text-gray-400">{status.checksumSha256 || 'not recorded'}</span></div>
                      {fundSnapshots.map((snapshot) => <div key={snapshot.snapshotId} className="mt-2 border-t border-gray-800 pt-2">
                        <div>{snapshot.snapshotId} · {snapshot.status}{snapshot.isActive ? ' · active' : ''}</div>
                        <div>{formatPercentage(snapshot.coveragePct)}% · {snapshot.holdingCount} rows · {snapshot.ageDays} days</div>
                        {snapshot.notes && <div className="mt-1 text-gray-400">{snapshot.notes}</div>}
                        {snapshot.validationErrors && <div className="mt-1 text-red-300">{snapshot.validationErrors}</div>}
                        {snapshot.sourceUrls.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="mr-2 block truncate text-blue-400 hover:underline">{url}</a>)}
                        {snapshot.evidencePath && <div className="mt-1 break-all font-mono text-[10px] text-gray-600">Evidence: {snapshot.evidencePath}</div>}
                      </div>)}
                    </DetailBlock>
                    <DetailBlock title="Unresolved / research queue">
                      {fundUnresolved.length === 0 ? <div className="text-emerald-400">No unresolved branch.</div> : fundUnresolved.map((item, index) => <div key={`${item.path}-${index}`} className="mb-2 border-b border-gray-800 pb-2">
                        <div className="text-gray-200">{item.unresolvedName}</div>
                        <div>{formatPercentage(item.weight * 100)}% · {fmtFull(item.marketValue)}</div>
                        <div className="text-amber-300">{item.reason}</div>
                        <div className="break-all font-mono text-[10px]">{item.path}</div>
                      </div>)}
                    </DetailBlock>
                    <DetailBlock title={`Resolved holdings (${fundHoldings.length})`}>
                      {fundHoldings.slice(0, 20).map((holding) => <div key={`${holding.holdingId}-${holding.lookthroughPath}`} className="flex gap-2 border-b border-gray-800 py-1">
                        <span className="min-w-0 flex-1 truncate text-gray-300" title={holding.lookthroughPath}>{holding.holdingName}</span>
                        <span className="tabular-nums text-gray-500">{formatPercentage(holding.weight * 100)}%</span>
                      </div>)}
                      {fundHoldings.length > 20 && <div className="mt-2">+ {fundHoldings.length - 20} more rows</div>}
                    </DetailBlock>
                  </div>
                </td></tr>}
              </Fragment>
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No fund matches this filter.</p>}
      </div>
    </SidePanel>
  )
}

function DetailBlock({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-lg border border-gray-800 bg-gray-900 p-3 text-xs text-gray-500"><h3 className="mb-2 font-semibold text-gray-200">{title}</h3>{children}</section>
}
