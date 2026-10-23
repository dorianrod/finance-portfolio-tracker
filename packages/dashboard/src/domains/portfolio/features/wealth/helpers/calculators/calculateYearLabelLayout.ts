import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/shared/helpers/mappers/mapAnnualIncomeSavings'

export type YearLabelTextAnchor = 'start' | 'middle' | 'end'

export interface YearLabelPlacement {
  dx: number
  dy: number
  textAnchor: YearLabelTextAnchor
}

interface LabelBox {
  left: number
  right: number
  top: number
  bottom: number
}

const LABEL_WIDTH = 32
const LABEL_HEIGHT = 14
const LABEL_CANDIDATES: YearLabelPlacement[] = [
  { dx: 0, dy: -12, textAnchor: 'middle' },
  { dx: 0, dy: 20, textAnchor: 'middle' },
  { dx: 10, dy: 4, textAnchor: 'start' },
  { dx: -10, dy: 4, textAnchor: 'end' },
  { dx: 10, dy: -10, textAnchor: 'start' },
  { dx: -10, dy: -10, textAnchor: 'end' },
  { dx: 10, dy: 17, textAnchor: 'start' },
  { dx: -10, dy: 17, textAnchor: 'end' },
]

function labelBox(x: number, y: number, placement: YearLabelPlacement): LabelBox {
  const labelX = x + placement.dx
  let left = labelX - LABEL_WIDTH
  if (placement.textAnchor === 'middle') left = labelX - LABEL_WIDTH / 2
  else if (placement.textAnchor === 'start') left = labelX
  const baseline = y + placement.dy
  return {
    left,
    right: left + LABEL_WIDTH,
    top: baseline - LABEL_HEIGHT + 2,
    bottom: baseline + 2,
  }
}

function overlapArea(a: LabelBox, b: LabelBox): number {
  return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
    * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
}

/** Greedily gives the newest years first choice, then moves colliding labels around their point. */
export function calculateYearLabelLayout(
  points: AnnualIncomeSavingsPoint[],
  chartWidth: number,
): YearLabelPlacement[] {
  if (points.length === 0) return []

  const plotWidth = Math.max(180, chartWidth - 80)
  const plotHeight = 215
  const incomes = points.map((point) => point.totalIncome)
  const rates = points.map((point) => point.placementRate ?? 0)
  const minIncome = Math.min(...incomes)
  const maxIncome = Math.max(...incomes)
  const minRate = Math.min(...rates)
  const maxRate = Math.max(...rates)
  const incomeRange = Math.max(1, maxIncome - minIncome)
  const rateRange = Math.max(1, maxRate - minRate)
  const coordinates = points.map((point) => ({
    x: 16 + ((point.totalIncome - minIncome) / incomeRange) * (plotWidth - 32),
    y: 16 + ((maxRate - (point.placementRate ?? 0)) / rateRange) * (plotHeight - 32),
  }))
  const placements: YearLabelPlacement[] = points.map(() => LABEL_CANDIDATES[0])
  const occupied: LabelBox[] = []
  const order = points
    .map((point, index) => ({ year: point.year, index }))
    .toSorted((a, b) => b.year - a.year)

  for (const { index } of order) {
    const coordinate = coordinates[index]
    let best = LABEL_CANDIDATES[0]
    let bestScore = Number.POSITIVE_INFINITY

    for (const [candidateIndex, candidate] of LABEL_CANDIDATES.entries()) {
      const box = labelBox(coordinate.x, coordinate.y, candidate)
      const labelOverlap = occupied.reduce((sum, other) => sum + overlapArea(box, other), 0)
      const pointOverlap = coordinates.reduce((sum, point) => {
        const inside = point.x >= box.left - 4 && point.x <= box.right + 4
          && point.y >= box.top - 4 && point.y <= box.bottom + 4
        return sum + (inside ? 1 : 0)
      }, 0)
      const outside = Math.max(0, -box.left)
        + Math.max(0, box.right - plotWidth)
        + Math.max(0, -box.top)
        + Math.max(0, box.bottom - plotHeight)
      const score = labelOverlap * 100 + pointOverlap * 1_000 + outside * 1_000 + candidateIndex

      if (score < bestScore) {
        best = candidate
        bestScore = score
      }
    }

    placements[index] = best
    occupied.push(labelBox(coordinate.x, coordinate.y, best))
  }

  return placements
}
