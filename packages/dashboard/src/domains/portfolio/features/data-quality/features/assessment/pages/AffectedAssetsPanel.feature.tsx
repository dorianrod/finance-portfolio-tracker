import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { DATA_QUALITY_DIMENSION_LABELS } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/formatters/dataQualityDimensionLabels'
import type { AffectedAsset } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/mappers/buildDataQualityViewModel'
import { useDataQualityClassificationDetails } from '@/domains/portfolio/features/data-quality/features/assessment/services/actions/useDataQualityClassificationDetails'
import {
  dataQualityClassificationDetailsOpenAtom,
  dataQualityClassificationDimensionAtom,
} from '@/domains/portfolio/features/data-quality/features/assessment/stores/dataQualityPanels.atoms'
import i18n from '@/i18n/i18n'
import { SidePanel } from '@/shared/ui/SidePanel.view'

import { AffectedAssetsTable } from './DataQualityDetails.view'
export function AffectedAssetsPanel({ assets }: { assets: AffectedAsset[] }) {
  const classificationDetailsOpen = useAtomValue(
    dataQualityClassificationDetailsOpenAtom,
  )
  const classificationDimension = useAtomValue(
    dataQualityClassificationDimensionAtom,
  )
  const { closeClassificationDetails } = useDataQualityClassificationDetails()
  const visibleAssets = useMemo(
    () =>
      classificationDimension
        ? assets.filter((asset) =>
            asset.dimensions.includes(classificationDimension),
          )
        : assets,
    [assets, classificationDimension],
  )

  return (
    <SidePanel
      open={classificationDetailsOpen}
      onClose={closeClassificationDetails}
      closeLabel={i18n.t('ui.dataqualitytab.closeAffectedAssetsDetails')}
      size="medium"
    >
      <SidePanel.Title>
        {classificationDimension
          ? i18n.t('ui.dataqualitytab.affectedAssetsValue0', {
              value0: DATA_QUALITY_DIMENSION_LABELS[classificationDimension],
            })
          : i18n.t('ui.dataqualitytab.affectedAssets')}
      </SidePanel.Title>
      <SidePanel.Description>
        {i18n.t(
          'ui.dataqualitytab.positionsContributingToUndocumentedDiversificationDataSortedByTheir',
        )}
      </SidePanel.Description>
      <AffectedAssetsTable assets={visibleAssets} />
    </SidePanel>
  )
}
