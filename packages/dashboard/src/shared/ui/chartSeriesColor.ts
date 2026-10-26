import { catColor, typeColor } from '@/shared/theme/chartColors'
import {
  SEMANTIC_COLORS,
  type SemanticColorKey,
} from '@/shared/theme/semanticColors'

export type SeriesColorGroup = {
  key: string
  index: number
  categories: Record<string, string>
}

export type SeriesColor =
  | { tone: SemanticColorKey; category?: never; group?: never }
  | { category: string; tone?: never; group?: never }
  | { group: SeriesColorGroup; tone?: never; category?: never }

export function resolveSeriesColor({
  tone,
  category,
  group,
}: {
  tone?: SemanticColorKey
  category?: string
  group?: SeriesColorGroup
}) {
  if (tone) return SEMANTIC_COLORS[tone]
  if (category !== undefined) return catColor(category)
  if (group) return typeColor(group.key, group.index, group.categories)
  throw new Error('A chart series requires a semantic tone or palette key.')
}
