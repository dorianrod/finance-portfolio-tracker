import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { dataQualityFundDiagnosticsOpenAtom } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/stores/dataQualityPanels/dataQualityFundDiagnosticsOpen.atoms'

export function useDataQualityFundDiagnostics() {
  const setFundDiagnosticsOpen = useSetAtom(dataQualityFundDiagnosticsOpenAtom)

  const openFundDiagnostics = useCallback(
    () => setFundDiagnosticsOpen(true),
    [setFundDiagnosticsOpen],
  )
  const closeFundDiagnostics = useCallback(
    () => setFundDiagnosticsOpen(false),
    [setFundDiagnosticsOpen],
  )

  return useMemo(
    () => ({
      closeFundDiagnostics,
      openFundDiagnostics,
    }),
    [closeFundDiagnostics, openFundDiagnostics],
  )
}
