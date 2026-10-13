import { useMemo, useState } from 'react'
import type { FundHolding } from '@/hooks/useFundHoldings'
import type { PositionRow } from '@/types/domain'
import { fmtFull } from '@/shared/format/money'
import { buildIssuerExposures } from './fundHoldings.logic'

export function FundHoldingsExplorer({ positions, holdings }: {
  positions: PositionRow[]
  holdings: FundHolding[]
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'value' | 'name'>('value')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const exposures = useMemo(() => buildIssuerExposures(positions, holdings), [positions, holdings])
  const displayed = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    const filtered = needle ? exposures.filter((issuer) => (
      issuer.name.toLocaleLowerCase().includes(needle)
      || issuer.id.toLocaleLowerCase().includes(needle)
      || issuer.securities.some((security) => security.name.toLocaleLowerCase().includes(needle))
      || issuer.funds.some((fund) => fund.toLocaleLowerCase().includes(needle))
    )) : exposures
    return [...filtered].sort(sort === 'value'
      ? (a, b) => b.value - a.value
      : (a, b) => a.name.localeCompare(b.name))
  }, [exposures, query, sort])

  const toggle = (id: string) => setExpanded((current) => {
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900">
      <div className="flex flex-col gap-3 border-b border-gray-800 p-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-white">All identified economic exposure</h2>
          <p className="mt-1 text-xs text-gray-500">Grouped by issuer, with security and source-fund detail underneath. Percentages use the whole selected portfolio.</p>
        </div>
        <div className="ml-auto flex w-full gap-2 sm:w-auto">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search issuer, security or fund"
            aria-label="Search underlying assets"
            className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-200 outline-none focus:border-blue-600 sm:w-72"
          />
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as 'value' | 'name')}
            aria-label="Sort underlying assets"
            className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-300"
          >
            <option value="value">Largest first</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>
      <div className="max-h-[720px] overflow-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-gray-800 text-xs uppercase tracking-wider text-gray-500">
            <tr><th className="px-4 py-2">Issuer</th><th className="px-4 py-2 text-right">Exposure</th><th className="px-4 py-2 text-right">Portfolio</th><th className="px-4 py-2">Sources</th></tr>
          </thead>
          <tbody>
            {displayed.map((issuer) => {
              const isOpen = expanded.has(issuer.id)
              return (
                <FragmentRows
                  key={issuer.id}
                  issuer={issuer}
                  open={isOpen}
                  onToggle={() => toggle(issuer.id)}
                />
              )
            })}
          </tbody>
        </table>
        {displayed.length === 0 && <p className="p-8 text-center text-sm text-gray-500">No exposure matches this search.</p>}
      </div>
      <div className="border-t border-gray-800 px-4 py-2 text-xs text-gray-600">{displayed.length} issuers · {exposures.reduce((sum, issuer) => sum + issuer.securities.length, 0)} securities</div>
    </section>
  )
}

function FragmentRows({ issuer, open, onToggle }: {
  issuer: ReturnType<typeof buildIssuerExposures>[number]
  open: boolean
  onToggle: () => void
}) {
  return <>
    <tr className="border-b border-gray-800 hover:bg-gray-800/60">
      <td className="px-4 py-2.5">
        <button type="button" onClick={onToggle} className="flex items-center gap-2 text-left">
          <span className={`text-gray-600 transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
          <span><span className="font-medium text-gray-100">{issuer.name}</span><span className="ml-2 font-mono text-[10px] text-gray-600">{issuer.id}</span></span>
        </button>
      </td>
      <td className="px-4 py-2.5 text-right font-medium tabular-nums text-gray-200">{fmtFull(issuer.value)}</td>
      <td className="px-4 py-2.5 text-right tabular-nums text-gray-400">{issuer.weight.toFixed(2)}%</td>
      <td className="max-w-xs truncate px-4 py-2.5 text-xs text-gray-500" title={issuer.funds.join(' · ')}>{issuer.funds.length ? `${issuer.funds.length} fund${issuer.funds.length > 1 ? 's' : ''}` : 'Direct'}</td>
    </tr>
    {open && issuer.securities.map((security) => (
      <tr key={`${issuer.id}-${security.id}`} className="border-b border-gray-900 bg-gray-950/50 text-xs">
        <td className="py-2 pl-12 pr-4"><span className="text-gray-300">{security.name}</span><span className="ml-2 font-mono text-[10px] text-gray-700">{security.id}</span></td>
        <td className="px-4 py-2 text-right tabular-nums text-gray-400">{fmtFull(security.value)}</td>
        <td className="px-4 py-2" />
        <td className="max-w-xs truncate px-4 py-2 text-gray-600" title={security.funds.join(' · ')}>{security.funds.join(' · ') || 'Direct holding'}</td>
      </tr>
    ))}
  </>
}
