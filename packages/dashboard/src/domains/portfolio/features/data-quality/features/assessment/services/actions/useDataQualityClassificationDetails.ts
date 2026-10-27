import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import type { DataQualityDimension } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/useBuildDataQualityViewModel'
import { dataQualityClassificationDetailsOpenAtom } from '@/domains/portfolio/features/data-quality/features/assessment/stores/dataQualityPanels/dataQualityClassificationDetailsOpenAtom'
import { dataQualityClassificationDimensionAtom } from '@/domains/portfolio/features/data-quality/features/assessment/stores/dataQualityPanels/dataQualityClassificationDimensionAtom'

export function useDataQualityClassificationDetails() {
  const setClassificationDetailsOpen = useSetAtom(
    dataQualityClassificationDetailsOpenAtom,
  )
  const setClassificationDimension = useSetAtom(
    dataQualityClassificationDimensionAtom,
  )

  const openClassificationDetails = useCallback(
    (dimension?: DataQualityDimension) => {
      setClassificationDimension(dimension ?? null)
      setClassificationDetailsOpen(true)
    },
    [setClassificationDetailsOpen, setClassificationDimension],
  )
  const openAllClassificationDetails = useCallback(
    () => openClassificationDetails(),
    [openClassificationDetails],
  )
  const closeClassificationDetails = useCallback(() => {
    setClassificationDetailsOpen(false)
    setClassificationDimension(null)
  }, [setClassificationDetailsOpen, setClassificationDimension])

  return useMemo(
    () => ({
      closeClassificationDetails,
      openAllClassificationDetails,
      openClassificationDetails,
    }),
    [
      closeClassificationDetails,
      openAllClassificationDetails,
      openClassificationDetails,
    ],
  )
}
