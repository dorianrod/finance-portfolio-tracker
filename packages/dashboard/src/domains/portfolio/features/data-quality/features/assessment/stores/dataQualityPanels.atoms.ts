import { atom } from 'jotai'

import type { DataQualityDimension } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/buildDataQualityViewModel'

export const dataQualityFundDiagnosticsOpenAtom = atom<boolean>(false)
export const dataQualityClassificationDetailsOpenAtom = atom<boolean>(false)
export const dataQualityClassificationDimensionAtom =
  atom<DataQualityDimension | null>(null)
