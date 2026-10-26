export function getPieLabelPosition(
  cx: number,
  cy: number,
  midAngle: number,
  outerRadius: number,
) {
  const radiansPerDegree = Math.PI / 180
  const radius = outerRadius + 22
  const x = cx + radius * Math.cos(-midAngle * radiansPerDegree)
  const y = cy + radius * Math.sin(-midAngle * radiansPerDegree)
  const anchor = x > cx ? 'start' : 'end'
  return { x, y, anchor } as const
}
