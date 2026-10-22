import { useCallback, useMemo } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import type {
  AffectedAsset,
  DataQualityDimension,
} from '../../helpers/mappers/buildDataQualityViewModel'
import type { QualityThemeId } from '@/domains/portfolio/types/quality'
import {
  dataQualityClassificationDetailsOpenAtom,
  dataQualityClassificationDimensionAtom,
  dataQualityFundDiagnosticsOpenAtom,
} from '../../stores/dataQualityPanels.atoms'

interface UseDataQualityPanelsInput {
  activeThemeId: QualityThemeId
  affectedAssets: AffectedAsset[]
  classificationApplicableValue: number
  fundIssueCount: number
  hasFundStatuses: boolean
  hasLookThroughScope: boolean
}

export function useDataQualityPanelActions() {
  const setFundDiagnosticsOpen = useSetAtom(dataQualityFundDiagnosticsOpenAtom)
  const setClassificationDetailsOpen = useSetAtom(dataQualityClassificationDetailsOpenAtom)
  const setClassificationDimension = useSetAtom(dataQualityClassificationDimensionAtom)

  const openFundDiagnostics = useCallback(() => setFundDiagnosticsOpen(true), [setFundDiagnosticsOpen])
  const closeFundDiagnostics = useCallback(() => setFundDiagnosticsOpen(false), [setFundDiagnosticsOpen])
  const openClassificationDetails = useCallback((dimension?: DataQualityDimension) => {
    setClassificationDimension(dimension ?? null)
    setClassificationDetailsOpen(true)
  }, [setClassificationDetailsOpen, setClassificationDimension])
  const openAllClassificationDetails = useCallback(
    () => openClassificationDetails(),
    [openClassificationDetails],
  )
  const closeClassificationDetails = useCallback(() => {
    setClassificationDetailsOpen(false)
    setClassificationDimension(null)
  }, [setClassificationDetailsOpen, setClassificationDimension])

  return useMemo(() => ({
    closeClassificationDetails,
    closeFundDiagnostics,
    openAllClassificationDetails,
    openClassificationDetails,
    openFundDiagnostics,
  }), [
    closeClassificationDetails,
    closeFundDiagnostics,
    openAllClassificationDetails,
    openClassificationDetails,
    openFundDiagnostics,
  ])
}

export function useDataQualityPanels({
  activeThemeId,
  affectedAssets,
  classificationApplicableValue,
  fundIssueCount,
  hasFundStatuses,
  hasLookThroughScope,
}: UseDataQualityPanelsInput) {
  const fundDiagnosticsOpen = useAtomValue(dataQualityFundDiagnosticsOpenAtom)
  const classificationDetailsOpen = useAtomValue(dataQualityClassificationDetailsOpenAtom)
  const classificationDimension = useAtomValue(dataQualityClassificationDimensionAtom)
  const {
    closeClassificationDetails,
    closeFundDiagnostics,
    openAllClassificationDetails,
    openClassificationDetails,
    openFundDiagnostics,
  } = useDataQualityPanelActions()

  const visibleAffectedAssets = useMemo(
    () => classificationDimension
      ? affectedAssets.filter((asset) => asset.dimensions.includes(classificationDimension))
      : affectedAssets,
    [affectedAssets, classificationDimension],
  )

  const activeDetailAction = useMemo(() => {
    if (activeThemeId === 'lookthrough' && hasLookThroughScope && hasFundStatuses) {
      return {
        label: 'Inspect',
        detail: `${fundIssueCount} issue${fundIssueCount === 1 ? '' : 's'} to inspect`,
        expanded: fundDiagnosticsOpen,
        onClick: openFundDiagnostics,
      }
    }

    if (activeThemeId === 'classification' && classificationApplicableValue > 0) {
      return {
        label: 'Inspect',
        detail: affectedAssets.length > 0
          ? `${affectedAssets.length} asset${affectedAssets.length === 1 ? '' : 's'} to inspect`
          : 'No affected asset',
        expanded: classificationDetailsOpen,
        onClick: openAllClassificationDetails,
      }
    }

    return null
  }, [
    activeThemeId,
    affectedAssets.length,
    classificationApplicableValue,
    classificationDetailsOpen,
    fundDiagnosticsOpen,
    fundIssueCount,
    hasFundStatuses,
    hasLookThroughScope,
    openAllClassificationDetails,
    openFundDiagnostics,
  ])

  return {
    activeDetailAction,
    classificationDetailsOpen,
    classificationDimension,
    closeClassificationDetails,
    closeFundDiagnostics,
    fundDiagnosticsOpen,
    openClassificationDetails,
    visibleAffectedAssets,
  }
}
