import { atom } from 'jotai'

import type { ChartTarget } from '@/domains/portfolio/features/holdings/features/positions/types/chartTarget.type'

const DEFAULT_POSITION_CHART_PREVIEW = null

export const positionChartPreviewAtom = atom<ChartTarget | null>(
  DEFAULT_POSITION_CHART_PREVIEW,
)
