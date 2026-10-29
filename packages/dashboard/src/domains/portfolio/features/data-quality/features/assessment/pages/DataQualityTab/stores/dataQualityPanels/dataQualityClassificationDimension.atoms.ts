import { atom } from 'jotai'

import type { DataQualityDimension } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQualityDimension.type'

export const dataQualityClassificationDimensionAtom =
  atom<DataQualityDimension | null>(null)
