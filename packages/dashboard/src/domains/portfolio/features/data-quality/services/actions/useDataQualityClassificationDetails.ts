import type { DataQualityDimension } from '@/domains/portfolio/features/data-quality/helpers/mappers/buildDataQualityViewModel'
import {
  dataQualityClassificationDetailsOpenAtom,
  dataQualityClassificationDimensionAtom,
} from '@/domains/portfolio/features/data-quality/stores/dataQualityPanels.atoms'
import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

export function useDataQualityClassificationDetails() {
  const setClassificationDetailsOpen = useSetAtom(dataQualityClassificationDetailsOpenAtom)
  const setClassificationDimension = useSetAtom(dataQualityClassificationDimensionAtom)

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
    [closeClassificationDetails, openAllClassificationDetails, openClassificationDetails],
  )
}
