import { CHART_COLORS, type ChartTone } from '@/shared/theme/chartColors'

export function resolveSeriesColor({ tone }: SeriesColor) {
  return CHART_COLORS[tone]
}

export type SeriesColor = { tone: ChartTone }
