import { CHART_COLORS } from '@/shared/theme/chartColors/chartColors'
import { CHART_THEME } from '@/shared/theme/chartTheme'

export const CHART_TEXT_TONES = {
  ...CHART_COLORS,
  tick: CHART_THEME.tick,
  label: CHART_THEME.label,
  tooltipText: 'var(--tooltip-text)',
  tooltipLabel: 'var(--tooltip-label)',
  tooltipDim: 'var(--tooltip-dim)',
} as const
