import { memo } from 'react'

import type { SecurityExposure } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/mappers/issuerExposures/buildFundHoldingsViewModel.types'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { SourcesCell } from './SourcesCell.view'

export const SecurityRow = memo(function SecurityRow({
  security,
}: {
  security: SecurityExposure
}) {
  const formatMoney = useFormatMoney()
  const [single] = security.funds
  return (
    <Surface variant="detailRow">
      <Grid arrangement="labelThreeValues">
        <Layout as="span" flow="inline">
          <Text truncate>
            <Layout as="span" flow="inline" inset="spacious">
              <Text tone="secondary">{security.name}</Text>
              <Layout as="span" flow="inline">
                <Text variant="tinyCode" tone="subtle">
                  {security.id}
                </Text>
              </Layout>
            </Layout>
          </Text>
        </Layout>
        <Text tone="muted" align="right" numeric>
          {formatMoney(security.value, { style: 'full' })}
        </Text>
        <span />
        {security.funds.length <= 1 ? (
          <Text tone="subtle" truncate title={single}>
            {single ?? i18n.t('ui.fundholdingsexplorer.directHolding')}
          </Text>
        ) : (
          <SourcesCell
            sources={security.sources}
            total={security.value}
            empty={i18n.t('ui.fundholdingsexplorer.directHolding')}
          />
        )}
      </Grid>
    </Surface>
  )
})
