import { memo } from 'react'

import type { IssuerExposure } from '@/domains/portfolio/features/holdings/features/fund-look-through/types/issuerExposure.type'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { DisclosureButton } from '@/shared/ui/controls/DisclosureButton.view'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { Chevron } from './Chevron.view'
import { SourcesCell } from './SourcesCell.view'

export const IssuerRow = memo(function IssuerRow({
  issuer,
  open,
  onToggle,
}: {
  issuer: IssuerExposure
  open: boolean
  onToggle: (id: string) => void
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (
    <Surface variant="hoverRow">
      <Grid arrangement="labelThreeValues">
        <Layout as="span" flow="control">
          <DisclosureButton
            type="button"
            onClick={() => onToggle(issuer.id)}
            expanded={open}
            variant="plainLeft"
          >
            <Chevron open={open} />
            <Text variant="medium" tone="default" truncate>
              {issuer.name}
            </Text>
            <Text variant="tinyCode" tone="subtle">
              {issuer.id}
            </Text>
          </DisclosureButton>
        </Layout>
        <Text variant="medium" tone="secondary" align="right" numeric>
          {formatMoney(issuer.value, { style: 'full' })}
        </Text>
        <Text tone="muted" align="right" numeric>
          {formatPercentage(issuer.weight, { decimals: 2 })}
        </Text>

        <SourcesCell
          sources={issuer.sources}
          total={issuer.value}
          empty={i18n.t('ui.fundholdingsexplorer.direct')}
          compact
        />
      </Grid>
    </Surface>
  )
})
