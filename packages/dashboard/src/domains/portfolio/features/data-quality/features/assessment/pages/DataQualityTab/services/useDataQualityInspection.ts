import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { QualityThemeId } from '@/domains/portfolio/features/data-quality/features/assessment/types/dataQuality.type'

import { useDataQualityPanels } from './useDataQualityPanels'

export function useDataQualityInspection({
  activeThemeId,
  affectedAssetCount,
  classificationApplicableValue,
  fundIssueCount,
  fundStatusCount,
  hasLookThroughScope,
}: InspectionInput) {
  const { t } = useTranslation()
  const {
    classificationDetailsOpen,
    fundDiagnosticsOpen,
    openAllClassificationDetails,
    openFundDiagnostics,
  } = useDataQualityPanels()

  return useMemo(() => {
    if (
      activeThemeId === 'lookthrough' &&
      hasLookThroughScope &&
      fundStatusCount > 0
    )
      return {
        label: t('ui.dataqualitytab.inspect'),
        detail: t('ui.dataqualitytab.issuesToInspect', {
          count: fundIssueCount,
        }),
        expanded: fundDiagnosticsOpen,
        onClick: openFundDiagnostics,
      }
    if (activeThemeId === 'classification' && classificationApplicableValue > 0)
      return {
        label: t('ui.dataqualitytab.inspect'),
        detail:
          affectedAssetCount > 0
            ? t('ui.dataqualitytab.assetsToInspect', {
                count: affectedAssetCount,
              })
            : t('ui.dataqualitytab.noAffectedAsset'),
        expanded: classificationDetailsOpen,
        onClick: openAllClassificationDetails,
      }
    return null
  }, [
    activeThemeId,
    affectedAssetCount,
    classificationApplicableValue,
    classificationDetailsOpen,
    fundDiagnosticsOpen,
    fundIssueCount,
    fundStatusCount,
    hasLookThroughScope,
    openAllClassificationDetails,
    openFundDiagnostics,
    t,
  ])
}

type InspectionInput = {
  activeThemeId: QualityThemeId
  affectedAssetCount: number
  classificationApplicableValue: number
  fundIssueCount: number
  fundStatusCount: number
  hasLookThroughScope: boolean
}
