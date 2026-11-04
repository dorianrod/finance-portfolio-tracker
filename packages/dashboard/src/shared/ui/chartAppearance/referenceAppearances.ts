import { CHART_COLORS } from '@/shared/theme/chartColors/chartColors'
import { CHART_THEME } from '@/shared/theme/chartTheme'

export const REFERENCE_APPEARANCES = {
  zero: { stroke: CHART_THEME.zeroLine },
  zeroDashed: { stroke: CHART_THEME.zeroLine, strokeDasharray: '3 3' },
  crosshair: { stroke: CHART_THEME.label, strokeDasharray: '4 4' },
  selected: {
    stroke: CHART_COLORS.series6,
    strokeOpacity: 0.55,
    strokeDasharray: '4 4',
  },
  benchmark: {
    stroke: CHART_COLORS.neutral,
    strokeDasharray: '5 4',
    strokeWidth: 2,
  },
} as const
