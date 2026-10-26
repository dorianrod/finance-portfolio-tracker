export const CHART_COLORS = {
  series1: '#3b82f6',
  series2: '#8b5cf6',
  series3: '#10b981',
  series4: '#f59e0b',
  series5: '#ef4444',
  series6: '#06b6d4',
  series7: '#f97316',
  series8: '#84cc16',
  series9: '#ec4899',
  series10: '#14b8a6',
  series11: '#a855f7',
  series12: '#f43f5e',
  series1Text: '#60a5fa',
  series1Detail: '#93c5fd',
  series1Stroke: '#1d4ed8',
  series2Text: '#c084fc',
  series5Text: '#f87171',
  series6Text: '#22d3ee',
  series7Text: '#fb923c',
  series7Stroke: '#c2410c',
  series11Stroke: '#7c3aed',
  secondary: '#818cf8',
  secondaryText: '#a5b4fc',
  positive: '#22c55e',
  positiveText: '#4ade80',
  neutral: '#64748b',
  subtle: '#374151',
  muted: '#94a3b8',
  dim: '#6b7280',
  accentText: '#e879f9',
  mutedIndicator: 'var(--color-content-muted)',
} as const

export type ChartTone = keyof typeof CHART_COLORS

const SERIES_PALETTE = [
  'series1',
  'series2',
  'series3',
  'series4',
  'series5',
  'series6',
  'series7',
  'series8',
  'series9',
  'series10',
  'series11',
  'series12',
] as const

export function getHashedSeriesTone(key: string): ChartTone {
  let hash = 0
  for (let i = 0; i < key.length; i++)
    hash = (hash * 31 + key.charCodeAt(i)) & 0xffffffff
  return SERIES_PALETTE[Math.abs(hash) % SERIES_PALETTE.length]
}
