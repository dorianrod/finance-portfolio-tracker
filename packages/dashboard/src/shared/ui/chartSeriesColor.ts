import { CHART_COLORS, type ChartTone } from '@/shared/theme/chartColors'

export type SeriesColor = { tone: ChartTone }

export function resolveSeriesColor({ tone }: SeriesColor) {
  return CHART_COLORS[tone]
}
