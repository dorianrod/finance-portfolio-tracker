import type { ChartTone } from './chartColors.types'

export function getHashedSeriesTone(key: string): ChartTone {
  let hash = 0
  for (let i = 0; i < key.length; i++)
    hash = (hash * 31 + key.charCodeAt(i)) & 0xffffffff
  return SERIES_PALETTE[Math.abs(hash) % SERIES_PALETTE.length]
}

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
