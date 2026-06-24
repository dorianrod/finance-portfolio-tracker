export const fmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
export const fmtDec = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function fmtEur(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M€`
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}k€`
  return `${Math.round(v)}€`
}

export function fmtFull(v: number): string {
  return v.toLocaleString('en-GB', { maximumFractionDigits: 0 }) + ' €'
}

export function fmtPct(v: number, decimals = 1): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}%`
}

export function shortMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
}
