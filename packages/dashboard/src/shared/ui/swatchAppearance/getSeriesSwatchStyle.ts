import { CHART_COLORS } from '@/shared/theme/chartColors/chartColors'
import type { ChartTone } from '@/shared/theme/chartColors/chartColors.types'

export function getSeriesSwatchStyle(
  series: SeriesSwatchAppearance | undefined,
) {
  if (!series) return {}
  return {
    backgroundColor: CHART_COLORS[series.tone],
    ...(series.selected && {
      outline: '2px solid var(--ds-content)',
      outlineOffset: 1,
    }),
  }
}

export type SeriesSwatchAppearance = { tone: ChartTone; selected: boolean }
