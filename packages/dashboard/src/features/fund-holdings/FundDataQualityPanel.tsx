import { useMemo, useState } from 'react'
import type { FundHoldingStatus, FundQualityTier } from '@/hooks/useFundHoldings'
import { fmtFull } from '@/shared/format/money'
import { FundQualityBadge } from './FundQualityBadge'

export function FundDataQualityPanel({ statuses }: { statuses: FundHoldingStatus[] }) {
  const [filter, setFilter] = useState<'all' | 'issues' | FundQualityTier>('issues')
  const rows = useMemo(() => statuses
    .filter((status) => filter === 'all'
      || filter === status.qualityTier
      || (filter === 'issues' && (status.validationStatus !== 'ok' || status.residualPct > 0.5)))
    .sort((a, b) => b.residualValue - a.residualValue || b.marketValue - a.marketValue), [statuses, filter])

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 p-4">
        <div className="mr-auto">
          <h2 className="text-base font-semibold text-white">Fund data diagnostics</h2>
          <p className="mt-1 text-xs text-gray-500">Sorted by unexplained monetary impact.</p>
        </div>
        {(['issues', 'all', 'A', 'B', 'C', 'D'] as const).map((option) => (
          <button key={option} type="button" onClick={() => setFilter(option)} className={`rounded-lg border px-2.5 py-1 text-xs ${filter === option ? 'border-blue-600 bg-blue-950/50 text-blue-200' : 'border-gray-700 text-gray-500 hover:text-gray-300'}`}>{option === 'issues' ? 'Issues' : option === 'all' ? 'All' : `Tier ${option}`}</button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-xs">
          <thead className="bg-gray-800 uppercase tracking-wider text-gray-500"><tr><th className="px-4 py-2">Fund</th><th className="px-4 py-2">Quality</th><th className="px-4 py-2">Source / proxy</th><th className="px-4 py-2">Holdings date</th><th className="px-4 py-2 text-right">Explained</th><th className="px-4 py-2 text-right">Residual</th><th className="px-4 py-2">Diagnostic</th></tr></thead>
          <tbody>
            {rows.map((status) => (
              <tr key={status.parentId} className="border-t border-gray-800 align-top">
                <td className="px-4 py-3"><div className="font-medium text-gray-200">{status.parentName}</div><div className="mt-1 font-mono text-[10px] text-gray-600">{status.parentIsin || status.parentTicker}</div></td>
                <td className="px-4 py-3"><FundQualityBadge status={status} /></td>
                <td className="px-4 py-3"><a href={status.sourceUrl || undefined} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{status.sourceName || 'Unavailable'}</a><div className="mt-1 text-gray-600">{status.proxyName ? `Exact proxy: ${status.proxyName}` : status.sourceType}</div></td>
                <td className="px-4 py-3 text-gray-400">{status.holdingsDate || 'Unknown'}<div className="mt-1 text-gray-600">{status.holdingCount.toLocaleString()} rows · {status.refreshStreak} successful refreshes</div></td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-300">{status.explainedPct.toFixed(1)}%<div className="mt-1 text-gray-600">{fmtFull(status.explainedValue)}</div></td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-300">{status.residualPct.toFixed(1)}%<div className="mt-1 text-gray-600">{fmtFull(status.residualValue)}</div></td>
                <td className={`max-w-sm px-4 py-3 ${status.issues ? 'text-amber-300' : 'text-emerald-400'}`}>{status.issues || 'No detected issue'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-sm text-gray-500">No fund matches this filter.</p>}
      </div>
    </section>
  )
}
