import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'

import { dataQualityClassificationDetailsOpenAtom } from '@/domains/portfolio/features/data-quality/features/assessment/stores/dataQualityPanels/dataQualityClassificationDetailsOpenAtom'
import { dataQualityClassificationDimensionAtom } from '@/domains/portfolio/features/data-quality/features/assessment/stores/dataQualityPanels/dataQualityClassificationDimensionAtom'
import { dataQualityFundDiagnosticsOpenAtom } from '@/domains/portfolio/features/data-quality/features/assessment/stores/dataQualityPanels/dataQualityFundDiagnosticsOpenAtom'

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
