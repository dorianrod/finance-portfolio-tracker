import i18n from '@/i18n/i18n'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { ManualPriceOverrideRow } from './ManualPriceOverrideRow.view'
import type { ManualPriceOverridesProps } from './manualPriceOverridesTable.types'

export function ManualPriceOverridesTable({
  manualPriceOverrides,
}: ManualPriceOverridesProps) {
  return (
    <Layout overflow="auto">
      <Surface variant="outlined">
        <Surface variant="compactTable" as="table">
          <thead>
            <Surface as="tr" variant="tableHeader" tone="muted" align="left">
              <Inset as="th" inset="tableCell">
                <Text as="div" variant="medium">
                  {i18n.t('ui.errorstab.status')}
                </Text>
              </Inset>
              <Inset as="th" inset="tableCell">
                <Text as="div" variant="medium">
                  {i18n.t('ui.errorstab.asset')}
                </Text>
              </Inset>
              <Inset as="th" inset="tableCell">
                <Text as="div" variant="medium">
                  {i18n.t('ui.errorstab.isinTicker')}
                </Text>
              </Inset>
              <Inset as="th" inset="tableCell">
                <Text as="div" variant="medium">
                  {i18n.t('ui.errorstab.forcedPrice')}
                </Text>
              </Inset>
              <Inset as="th" inset="tableCell">
                <Text as="div" variant="medium">
                  {i18n.t('ui.errorstab.from')}
                </Text>
              </Inset>
              <Inset as="th" inset="tableCell">
                <Text as="div" variant="medium">
                  {i18n.t('ui.errorstab.until')}
                </Text>
              </Inset>
              <Inset as="th" inset="tableCell">
                <Text as="div" variant="medium">
                  {i18n.t('ui.errorstab.source')}
                </Text>
              </Inset>
            </Surface>
          </thead>
          <tbody>
            {manualPriceOverrides.length === 0 ? (
              <tr>
                <Inset colSpan={7} as="td" inset="spacious">
                  <Text as="div" tone="subtle" align="center">
                    {i18n.t('ui.errorstab.noManualPriceOverrides')}
                  </Text>
                </Inset>
              </tr>
            ) : (
              manualPriceOverrides.map((row) => (
                <ManualPriceOverrideRow key={row.source_file} row={row} />
              ))
            )}
          </tbody>
        </Surface>
      </Surface>
    </Layout>
  )
}
