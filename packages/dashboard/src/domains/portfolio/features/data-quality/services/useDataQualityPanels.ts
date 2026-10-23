import { useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { useDataQualityClassificationDetails } from './actions/useDataQualityClassificationDetails'
import { useDataQualityFundDiagnostics } from './actions/useDataQualityFundDiagnostics'
import {
  dataQualityClassificationDetailsOpenAtom,
  dataQualityClassificationDimensionAtom,
  dataQualityFundDiagnosticsOpenAtom,
} from '../stores/dataQualityPanels.atoms'

export function useDataQualityPanels() {
  const fundDiagnosticsOpen = useAtomValue(dataQualityFundDiagnosticsOpenAtom)
  const classificationDetailsOpen = useAtomValue(dataQualityClassificationDetailsOpenAtom)
  const classificationDimension = useAtomValue(dataQualityClassificationDimensionAtom)
  const {
    closeClassificationDetails,
    openAllClassificationDetails,
  } = useDataQualityClassificationDetails()
  const {
    closeFundDiagnostics,
    openFundDiagnostics,
  } = useDataQualityFundDiagnostics()

  useEffect(() => () => {
    closeClassificationDetails()
    closeFundDiagnostics()
  }, [closeClassificationDetails, closeFundDiagnostics])

  return {
    classificationDetailsOpen,
    classificationDimension,
    closeClassificationDetails,
    fundDiagnosticsOpen,
    openAllClassificationDetails,
    openFundDiagnostics,
  }
}
