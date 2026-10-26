import { type ScatterShapeProps, Symbols } from 'recharts'

import { CHART_COLORS } from '@/shared/theme/chartColors/chartColors'
import type { ChartTone } from '@/shared/theme/chartColors/chartColors.types'
import { type ChartAge, chartAgeOpacity } from '@/shared/ui/chartAgeAppearance'

export function ChartSymbol({
  geometry,
  tone,
  age,
}: {
  geometry: Pick<Partial<ScatterShapeProps>, 'cx' | 'cy' | 'size'>
  tone: ChartTone
  age?: ChartAge
}) {
  return (
    <Symbols
      cx={geometry.cx}
      cy={geometry.cy}
      size={geometry.size}
      type="circle"
      fill={CHART_COLORS[tone]}
      fillOpacity={age && chartAgeOpacity(age)}
    />
  )
}
