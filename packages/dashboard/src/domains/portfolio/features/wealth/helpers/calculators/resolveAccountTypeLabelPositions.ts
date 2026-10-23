import type { AccountTypePoint } from '@/domains/portfolio/shared/types/history'

export interface AccountTypeDonutPoint extends AccountTypePoint {
  _label: string
}

export interface AccountTypeLabelPosition {
  x: number
  y: number
  isRight: boolean
}

export function resolveAccountTypeLabelPositions(
  data: AccountTypeDonutPoint[],
  cx: number,
  cy: number,
  outerRadius: number,
): AccountTypeLabelPosition[] {
  const total = data.reduce((sum, point) => sum + point.total_value, 0)
  const labelRadius = outerRadius + 24
  let cursorAngle = 90
  const positions = data.map((point, index) => {
    const sweep = total > 0 ? point.total_value / total * 360 : 0
    const midAngle = cursorAngle - sweep / 2
    cursorAngle -= sweep
    const radians = -midAngle * Math.PI / 180
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
    const side = positions.filter((position) => position.isRight === isRight).sort((a, b) => a.desiredY - b.desiredY)
    if (side.length === 0) continue
    const gap = side.length > 1 ? Math.min(17, (maxY - minY) / (side.length - 1)) : 0

    side[0].y = Math.max(minY, side[0].desiredY)
    for (let i = 1; i < side.length; i++) {
      side[i].y = Math.max(side[i].desiredY, side[i - 1].y + gap)
    }
    if (side.at(-1)!.y > maxY) {
      side[side.length - 1].y = maxY
      for (let i = side.length - 2; i >= 0; i--) {
        side[i].y = Math.min(side[i].y, side[i + 1].y - gap)
      }
    }
    if (side[0].y < minY) {
      const shift = minY - side[0].y
      side.forEach((position) => { position.y += shift })
    }
  }

  return positions.toSorted((a, b) => a.index - b.index)
}
