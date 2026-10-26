import { memo } from 'react'

import type { ExposureRow } from '@/domains/portfolio/features/holdings/features/fund-look-through/helpers/mappers/buildFundExposureViewModel'
import type {
  IssuerExposure,
  SecurityExposure,
} from '@/domains/portfolio/shared/helpers/mappers/buildFundHoldingsViewModel'
import i18n from '@/i18n/i18n'
import { useFormatMoney } from '@/shared/helpers/formatters/useFormatMoney'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { useFormatPercentage } from '@/shared/helpers/formatters/useFormatPercentage'
import { DisclosureButton } from '@/shared/ui/Controls.view'
import { TreeChevronIcon } from '@/shared/ui/Icons.view'
import { Grid, Inline, Layout, Stack } from '@/shared/ui/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'
import { Tooltip } from '@/shared/ui/Tooltip.view'
import { VirtualRow } from '@/shared/ui/VirtualRow.view'

export function VirtualExposureRow({
  item,
  onToggle,
  row,
  scrollMargin,
}: {
  item: VirtualExposureItem
  onToggle: (id: string) => void
  row: ExposureRow
  scrollMargin: number
}) {
  return (
    <VirtualRow height={item.size} offset={item.start - scrollMargin}>
      {row.kind === 'issuer' && (
        <IssuerRow issuer={row.issuer} open={row.open} onToggle={onToggle} />
      )}
      {row.kind === 'security' && <SecurityRow security={row.security} />}
      {row.kind === 'source' && <SourceRow fund={row.fund} value={row.value} />}
    </VirtualRow>
  )
}

export function SourcesCell({
  sources,
  total,
  empty,
  compact = false,
}: {
  sources: Source[]
  total: number
  empty: string
  compact?: boolean
}) {
  const formatNumber = useFormatNumber()
  if (sources.length <= 1) {
    return (
      <Text
        tone="subtle"
        variant={compact ? 'caption' : 'inherit'}
        truncate
        title={sources[0]?.fund}
      >
        {sources[0]?.fund ?? empty}
      </Text>
    )
  }
  return (
    <Tooltip>
      <Layout as="span" flow="inline" width="content">
        <Tooltip.Trigger variant="source">
          <Text tone="subtle" variant={compact ? 'caption' : 'inherit'}>
            {i18n.t('ui.fundholdingsexplorer.fundCount', {
              count: sources.length,
              formattedCount: formatNumber(sources.length),
            })}
          </Text>
        </Tooltip.Trigger>
      </Layout>
      <Tooltip.Content>
        <SourcesTooltip sources={sources} total={total} />
      </Tooltip.Content>
    </Tooltip>
  )
}

export function SourceTooltipRow({
  source,
  total,
}: {
  source: Source
  total: number
}) {
  const formatMoney = useFormatMoney()
  const formatPercentage = useFormatPercentage()
  return (
    <Inline as="li" align="baseline" gap="default">
      <Layout as="span" flow="inline" sizing="flexible">
        <Text tone="secondary" truncate>
          {source.fund}
        </Text>
      </Layout>
      <Text tone="muted" numeric>
        {formatMoney(source.value, { style: 'full' })}
      </Text>
      <Layout as="span" flow="inline">
        <Text tone="subtle" align="right" numeric>
          {formatPercentage(total > 0 ? (source.value / total) * 100 : 0, {
            decimals: 0,
          })}
        </Text>
      </Layout>
    </Inline>
  )
}

export function SourcesTooltip({
  sources,
  total,
}: {
  sources: Source[]
  total: number
}) {
  const formatNumber = useFormatNumber()
  return (
    <div>
      <Layout spaceAfter="default">
        <Text as="div" variant="tinyOverline" tone="subtle">
          {i18n.t('ui.fundholdingsexplorer.heldThroughFunds', {
            count: sources.length,
            formattedCount: formatNumber(sources.length),
          })}
        </Text>
      </Layout>
      <Stack as="ul" gap="compact" overflow="clip">
        {sources.map((source) => (
          <SourceTooltipRow key={source.fund} source={source} total={total} />
        ))}
      </Stack>
    </div>
  )
}

export function Chevron({ open }: { open: boolean }) {
  return <TreeChevronIcon expanded={open} />
}

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

export const SourceRow = memo(function SourceRow({
  fund,
  value,
}: {
  fund: string
  value: number
}) {
  const formatMoney = useFormatMoney()
  return (
    <Surface variant="detailRow">
      <Grid arrangement="labelThreeValues">
        <span />
        <Text tone="subtle" align="right" numeric>
          {formatMoney(value, { style: 'full' })}
        </Text>
        <span />
        <Text tone="subtle" truncate title={fund}>
          {fund}
        </Text>
      </Grid>
    </Surface>
  )
})

export const GRID =
  'grid grid-cols-[minmax(0,1fr)_140px_90px_minmax(0,220px)] items-center gap-x-4 px-4'

export type VirtualExposureItem = { index: number; size: number; start: number }

export type Source = { fund: string; value: number }
