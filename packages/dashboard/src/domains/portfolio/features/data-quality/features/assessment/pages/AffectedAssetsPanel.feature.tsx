import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useFormatDataQualityDimension } from '@/domains/portfolio/features/data-quality/features/assessment/helpers/formatters/useFormatDataQualityDimension'
import { AffectedAssetsTable } from '@/domains/portfolio/features/data-quality/features/assessment/pages/dataQualityDetails/AffectedAssetsTable.view'
import { useDataQualityClassificationDetails } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/services/actions/useDataQualityClassificationDetails'
import { dataQualityClassificationDetailsOpenAtom } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/stores/dataQualityPanels/dataQualityClassificationDetailsOpen.atoms'
import { dataQualityClassificationDimensionAtom } from '@/domains/portfolio/features/data-quality/features/assessment/pages/DataQualityTab/stores/dataQualityPanels/dataQualityClassificationDimension.atoms'
import type { AffectedAsset } from '@/domains/portfolio/features/data-quality/features/assessment/types/affectedAsset.type'
import i18n from '@/i18n/i18n'
import { SidePanel } from '@/shared/ui/SidePanel.view'
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

  const formatDimension = useFormatDataQualityDimension()
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
              value0: formatDimension(classificationDimension),
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
