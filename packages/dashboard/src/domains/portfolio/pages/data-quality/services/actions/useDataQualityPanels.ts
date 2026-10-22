import { useCallback, useMemo, useState } from 'react'
import type {
  AffectedAsset,
  DataQualityDimension,
} from '../../helpers/mappers/buildDataQualityViewModel'
import type { QualityThemeId } from '@/domains/portfolio/types/quality'

interface UseDataQualityPanelsInput {
  activeThemeId: QualityThemeId
  affectedAssets: AffectedAsset[]
  classificationApplicableValue: number
  fundIssueCount: number
  hasFundStatuses: boolean
  hasLookThroughScope: boolean
}

export function useDataQualityPanels({
  activeThemeId,
  affectedAssets,
  classificationApplicableValue,
  fundIssueCount,
  hasFundStatuses,
  hasLookThroughScope,
}: UseDataQualityPanelsInput) {
  const [fundDiagnosticsOpen, setFundDiagnosticsOpen] = useState(false)
  const [classificationDetailsOpen, setClassificationDetailsOpen] = useState(false)
  const [classificationDimension, setClassificationDimension] =
    useState<DataQualityDimension | null>(null)

  const openFundDiagnostics = useCallback(() => setFundDiagnosticsOpen(true), [])
  const closeFundDiagnostics = useCallback(() => setFundDiagnosticsOpen(false), [])
  const openClassificationDetails = useCallback((dimension?: DataQualityDimension) => {
    setClassificationDimension(dimension ?? null)
    setClassificationDetailsOpen(true)
  }, [])
  const openAllClassificationDetails = useCallback(
    () => openClassificationDetails(),
    [openClassificationDetails],
  )
  const closeClassificationDetails = useCallback(() => {
    setClassificationDetailsOpen(false)
    setClassificationDimension(null)
  }, [])

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
