import { GRADIENT_PROFILES } from './chartAppearance'
import { resolveSeriesColor, type SeriesColor } from './chartSeriesColor'

export function SeriesGradient({
  id,
  profile = 'soft',
  tone,
  category,
  group,
}: SeriesColor & { id: string; profile?: keyof typeof GRADIENT_PROFILES }) {
  const color = resolveSeriesColor({ tone, category, group })
  const [start, end] = GRADIENT_PROFILES[profile]
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={color} stopOpacity={start} />
      <stop offset="95%" stopColor={color} stopOpacity={end} />
    </linearGradient>
  )
}
