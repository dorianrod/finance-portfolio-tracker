import { useMemo, useState } from 'react'

import { calculateYearLabelLayout } from '@/domains/portfolio/features/wealth/components/IncomePlacementRelationshipChart/helpers/presenters/calculateYearLabelLayout'
import { analyseIncomePlacement } from '@/domains/portfolio/features/wealth/helpers/mappers/mapAnnualIncomeSavings/analyseIncomePlacement'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/helpers/mappers/mapAnnualIncomeSavings/mapAnnualIncomeSavings.types'

export function useIncomePlacementChart(data: AnnualIncomeSavingsPoint[]) {
  const analysis = useMemo(() => analyseIncomePlacement(data), [data])
  const [chartWidth, setChartWidth] = useState(600)
  const years = useMemo(
    () => analysis.points.map((point) => point.year),
    [analysis.points],
  )
  const recentYears = useMemo(
    () => new Set(years.toSorted((a, b) => b - a).slice(0, 3)),
    [years],
  )
  const labelPlacements = useMemo(
    () => calculateYearLabelLayout(analysis.points, chartWidth),
    [analysis.points, chartWidth],
  )
  return useMemo(
    () => ({
      analysis,
      labelPlacements,
      newestYear: years.length > 0 ? Math.max(...years) : 0,
      oldestYear: years.length > 0 ? Math.min(...years) : 0,
      recentYears,
      setChartWidth,
    }),
    [analysis, labelPlacements, years, recentYears, setChartWidth],
  )
}
