// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BuySellDot(props: any) {
  const { cx, cy, payload } = props
  if (payload.hasBuy && payload.hasSell) {
    return <circle cx={cx} cy={cy} r={6} fill="#a855f7" stroke="#7c3aed" strokeWidth={2} />
  }
  if (payload.hasBuy) {
    return <circle cx={cx} cy={cy} r={5} fill="#3b82f6" stroke="#1d4ed8" strokeWidth={2} />
  }
  if (payload.hasSell) {
    return <circle cx={cx} cy={cy} r={5} fill="#f97316" stroke="#c2410c" strokeWidth={2} />
  }
  return <g />
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function BuySellDotUnit(props: any) {
  const { cx, cy, payload } = props
  if (payload.hasBuy) return <circle cx={cx} cy={cy} r={5} fill="#3b82f6" stroke="#1d4ed8" strokeWidth={2} />
  if (payload.hasSell) return <circle cx={cx} cy={cy} r={5} fill="#f97316" stroke="#c2410c" strokeWidth={2} />
  return <g />
}
