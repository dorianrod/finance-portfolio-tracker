export function accountLabel(account: string, labels: Record<string, string>): string {
  if (labels[account]) return labels[account]
  return account.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function toggle(set: Set<string>, value: string): Set<string> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

export function presetDateFrom(months: number): string {
  const now = new Date()
  if (months === 0) return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const d = new Date(now)
  d.setMonth(d.getMonth() - months)
  return d.toISOString().slice(0, 10)
}
