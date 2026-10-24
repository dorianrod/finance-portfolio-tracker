import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'

import {
  dataQualityClassificationDetailsOpenAtom,
  dataQualityClassificationDimensionAtom,
  dataQualityFundDiagnosticsOpenAtom,
} from '@/domains/portfolio/features/data-quality/stores/dataQualityPanels.atoms'

import { useDataQualityClassificationDetails } from './actions/useDataQualityClassificationDetails'
import { useDataQualityFundDiagnostics } from './actions/useDataQualityFundDiagnostics'

export function useDataQualityPanels() {
  const fundDiagnosticsOpen = useAtomValue(dataQualityFundDiagnosticsOpenAtom)
  const classificationDetailsOpen = useAtomValue(
    dataQualityClassificationDetailsOpenAtom,
  )
  const classificationDimension = useAtomValue(
    dataQualityClassificationDimensionAtom,
  )
  const { closeClassificationDetails, openAllClassificationDetails } =
    useDataQualityClassificationDetails()
  const { closeFundDiagnostics, openFundDiagnostics } =
    useDataQualityFundDiagnostics()

  useEffect(
    () => () => {
      closeClassificationDetails()
      closeFundDiagnostics()
    },
    [closeClassificationDetails, closeFundDiagnostics],
  )

  return useMemo(
    () => ({
      classificationDetailsOpen,
      classificationDimension,
      closeClassificationDetails,
      fundDiagnosticsOpen,
      openAllClassificationDetails,
      openFundDiagnostics,
    }),
    [
      classificationDetailsOpen,
      classificationDimension,
      closeClassificationDetails,
      fundDiagnosticsOpen,
      openAllClassificationDetails,
      openFundDiagnostics,
    ],
  )
}
