import { CHART_COLORS } from '@/shared/theme/chartColors/chartColors'
import type { ChartTone } from '@/shared/theme/chartColors/chartColors.types'

export function resolveSeriesColor({ tone }: SeriesColor) {
  return CHART_COLORS[tone]
}

export type SeriesColor = { tone: ChartTone }
