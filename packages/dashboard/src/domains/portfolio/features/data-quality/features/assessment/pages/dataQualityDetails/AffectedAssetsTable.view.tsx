import type { AffectedAsset } from '@/domains/portfolio/features/data-quality/features/assessment/types/affectedAsset.type'
import i18n from '@/i18n/i18n'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { AffectedAssetRow } from './AffectedAssetRow.view'

export function AffectedAssetsTable({ assets }: { assets: AffectedAsset[] }) {
  if (assets.length === 0) {
    return (
      <Text as="p" variant="body" tone="subtle" align="center">
        <Layout as="span" flow="block" inset="spacious">
          {i18n.t('ui.dataqualitytab.noAffectedAssetForThisScope')}
        </Layout>
      </Text>
    )
  }

  return (
    <Layout overflow="auto">
      <Surface variant="compactTable" as="table" align="left">
        <Surface as="thead" variant="plain" tone="subtle">
          <Surface as="tr" variant="sectionEnd">
            <Inset as="th" inset="default">
              <Text as="div" variant="medium">
                {i18n.t('ui.dataqualitytab.asset')}
              </Text>
            </Inset>
            <Inset as="th" inset="default">
              <Text as="div" variant="medium">
                {i18n.t('ui.dataqualitytab.affectedDimensions')}
              </Text>
            </Inset>
            <Inset as="th" inset="default">
              <Text as="div" variant="medium" align="right">
                {i18n.t('ui.dataqualitytab.largestGap')}
              </Text>
            </Inset>
            <Inset as="th" inset="default">
              <Text as="div" variant="medium" align="right">
                {i18n.t('ui.dataqualitytab.positionValue')}
              </Text>
            </Inset>
          </Surface>
        </Surface>
        <tbody>
          {assets.map((asset) => (
            <AffectedAssetRow key={asset.id} asset={asset} />
          ))}
        </tbody>
      </Surface>
    </Layout>
  )
}
