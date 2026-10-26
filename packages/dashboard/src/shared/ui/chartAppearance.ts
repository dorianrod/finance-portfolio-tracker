import { CHART_COLORS } from '@/shared/theme/chartColors'
import { CHART_THEME } from '@/shared/theme/chartTheme'

export const CHART_AXIS_TICK = { fill: CHART_THEME.tick, fontSize: 11 }

export const CHART_GRID_PATTERNS = {
  dashed: '3 3',
  solid: undefined,
} as const

export const CHART_TEXT_TONES = {
  ...CHART_COLORS,
  tick: CHART_THEME.tick,
  label: CHART_THEME.label,
  tooltipText: 'var(--tooltip-text)',
  tooltipLabel: 'var(--tooltip-label)',
  tooltipDim: 'var(--tooltip-dim)',
} as const

export const LINE_WEIGHTS = { fine: 1.5, regular: 2, emphasized: 2.5 } as const
export const BAR_CORNERS = {
  flat: [0, 0, 0, 0],
  top: [3, 3, 0, 0],
  bottom: [0, 0, 3, 3],
  right: [0, 3, 3, 0],
  wideRight: [0, 4, 4, 0],
  rounded: 3,
} satisfies Record<string, number | [number, number, number, number]>
export const BAR_PROMINENCE = {
  full: 1,
  strong: 0.9,
  muted: 0.45,
  subtle: 0.4,
} as const
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
export const LINE_PATTERNS = { projection: '5 4', baseline: '4 2' } as const
export const GRADIENT_PROFILES = {
  dense: [0.8, 0.4],
  soft: [0.25, 0],
  medium: [0.35, 0],
  layered: [0.7, 0.15],
  base: [0.6, 0.2],
  strong: [0.7, 0.2],
  light: [0.35, 0.04],
  subtle: [0.3, 0.03],
} as const
export const LINE_MARKERS = {
  hidden: false,
  tiny: { r: 2, strokeWidth: 1 },
  normal: { r: 3 },
} as const
export const LINE_HOVER_MARKERS = {
  hidden: false,
  default: { r: 4 },
  large: { r: 5 },
} as const

export function getLineHoverMarker(
  profile: keyof typeof LINE_HOVER_MARKERS | 'series' | undefined,
  color: string,
) {
  if (profile === 'series') return { r: 4, fill: color }
  return profile && LINE_HOVER_MARKERS[profile]
}

export const CHART_CURSORS = {
  bar: { fill: CHART_THEME.cursor },
  dashed: { strokeDasharray: '3 3' },
  line: { stroke: CHART_THEME.label, strokeOpacity: 0.25 },
} as const
export function seriesFill(gradientId?: string) {
  return gradientId ? `url(#${gradientId})` : 'none'
}
