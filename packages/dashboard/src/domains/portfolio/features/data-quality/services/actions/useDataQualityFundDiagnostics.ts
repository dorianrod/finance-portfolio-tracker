import { dataQualityFundDiagnosticsOpenAtom } from '@/domains/portfolio/features/data-quality/stores/dataQualityPanels.atoms'
import { useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

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
