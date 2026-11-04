import type { AccountTypeLabelPosition } from '@/domains/portfolio/features/wealth/components/AccountTypeBreakdownChart/helpers/presenters/resolveAccountTypeLabelPositions'

export function getAccountTypeLeaderLine(
  cx: number,
  cy: number,
  midAngle: number,
  outerRadius: number,
  position: AccountTypeLabelPosition,
): string {
  const radians = (-midAngle * Math.PI) / 180
  const edgeRadius = outerRadius + 2
  const elbowRadius = outerRadius + 10
  const edgeX = cx + edgeRadius * Math.cos(radians)
  const edgeY = cy + edgeRadius * Math.sin(radians)
  const elbowX = cx + elbowRadius * Math.cos(radians)
  const elbowY = cy + elbowRadius * Math.sin(radians)
  const lineEndX = position.x + (position.isRight ? -4 : 4)
  return `${edgeX},${edgeY} ${elbowX},${elbowY} ${lineEndX},${position.y}`
}
