import { GRADIENT_PROFILES } from '@/shared/ui/chartAppearance/gradientProfiles'

import { resolveSeriesColor, type SeriesColor } from './chartSeriesColor'

export function SeriesGradient({
  id,
  profile = 'soft',
  tone,
}: SeriesColor & { id: string; profile?: keyof typeof GRADIENT_PROFILES }) {
  const color = resolveSeriesColor({ tone })
  const [start, end] = GRADIENT_PROFILES[profile]
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={color} stopOpacity={start} />
      <stop offset="95%" stopColor={color} stopOpacity={end} />
    </linearGradient>
  )
}
