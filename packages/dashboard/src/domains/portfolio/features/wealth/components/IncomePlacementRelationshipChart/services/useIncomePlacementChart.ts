import { useMemo, useState } from 'react'

import { calculateYearLabelLayout } from '@/domains/portfolio/features/wealth/components/IncomePlacementRelationshipChart/helpers/presenters/calculateYearLabelLayout'
import { analyseIncomePlacement } from '@/domains/portfolio/features/wealth/helpers/calculators/analyseIncomePlacement'
import type { AnnualIncomeSavingsPoint } from '@/domains/portfolio/features/wealth/types/annualIncomeSavingsPoint.type'

export function useIncomePlacementChart(data: AnnualIncomeSavingsPoint[]) {
  const analysis = useMemo(() => analyseIncomePlacement(data), [data])
  const [chartWidth, setChartWidth] = useState(600)
  const yearSummary = useMemo(() => {
    const years = analysis.points.map((point) => point.year)
    return {
      newestYear: years.length > 0 ? Math.max(...years) : 0,
      oldestYear: years.length > 0 ? Math.min(...years) : 0,
      recentYears: new Set(years.toSorted((a, b) => b - a).slice(0, 3)),
    }
  }, [analysis.points])
  const labelPlacements = useMemo(
    () => calculateYearLabelLayout(analysis.points, chartWidth),
    [analysis.points, chartWidth],
  )
  return useMemo(
    () => ({
      analysis,
      labelPlacements,
      ...yearSummary,
      setChartWidth,
    }),
    [analysis, labelPlacements, yearSummary, setChartWidth],
  )
}
