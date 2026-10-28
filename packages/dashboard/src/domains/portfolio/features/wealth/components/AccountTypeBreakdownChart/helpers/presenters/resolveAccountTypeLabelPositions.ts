import type { AccountTypePoint } from '@/domains/portfolio/features/wealth/types/accountTypePoint.type'

export function resolveAccountTypeLabelPositions(
  data: AccountTypePoint[],
  cx: number,
  cy: number,
  outerRadius: number,
): AccountTypeLabelPosition[] {
  const visibleData = data.filter((point) => point.total_value > 0)
  const total = visibleData.reduce((sum, point) => sum + point.total_value, 0)
  const labelRadius = outerRadius + 24
  let cursorAngle = 90
  const positions = visibleData.map((point, index) => {
    const sweep = total > 0 ? (point.total_value / total) * 360 : 0
    const midAngle = cursorAngle - sweep / 2
    cursorAngle -= sweep
    const radians = (-midAngle * Math.PI) / 180
    const isRight = Math.cos(radians) >= 0
    return {
      index,
      isRight,
      desiredY: cy + labelRadius * Math.sin(radians),
      x: cx + (isRight ? labelRadius : -labelRadius),
      y: 0,
    }
  })

  const minY = cy - labelRadius + 6
  const maxY = cy + labelRadius - 6
  for (const isRight of [false, true]) {
    const side = positions
      .filter((position) => position.isRight === isRight)
      .toSorted((a, b) => a.desiredY - b.desiredY)
    const last = side.at(-1)
    if (!last) continue
    const first = side[0]
    const gap =
      side.length > 1 ? Math.min(17, (maxY - minY) / (side.length - 1)) : 0

    first.y = Math.max(minY, first.desiredY)
    for (let i = 1; i < side.length; i++) {
      side[i].y = Math.max(side[i].desiredY, side[i - 1].y + gap)
    }
    if (last.y > maxY) {
      last.y = maxY
      for (let i = side.length - 2; i >= 0; i--) {
        side[i].y = Math.min(side[i].y, side[i + 1].y - gap)
      }
    }
    if (first.y < minY) {
      const shift = minY - first.y
      side.forEach((position) => {
        position.y += shift
      })
    }
  }

  return positions.toSorted((a, b) => a.index - b.index)
}

export type AccountTypeLabelPosition = {
  x: number
  y: number
  isRight: boolean
}
