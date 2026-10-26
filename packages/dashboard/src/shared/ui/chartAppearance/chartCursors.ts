import { CHART_THEME } from '@/shared/theme/chartTheme'

export const CHART_CURSORS = {
  bar: { fill: CHART_THEME.cursor },
  dashed: { strokeDasharray: '3 3' },
  line: { stroke: CHART_THEME.label, strokeOpacity: 0.25 },
} as const
