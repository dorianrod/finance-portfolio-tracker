import { selectRenderableAllocationCharts } from '@/domains/portfolio/features/holdings/features/positions/components/HoverAllocationPopover/helpers/presenters/selectRenderableAllocationCharts'
import { MiniDonut } from '@/domains/portfolio/features/holdings/features/positions/components/MiniDonut/MiniDonut.feature'
import type { AllocationHoverTarget } from '@/domains/portfolio/features/holdings/features/positions/types/allocationHoverTarget.type'
import i18n from '@/i18n/i18n'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Preview } from '@/shared/ui/Preview.view'
import { Text } from '@/shared/ui/Text.view'

export function HoverAllocationPopover({
  target,
  onMouseEnter,
  onMouseLeave,
}: {
  target: AllocationHoverTarget
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const { allocation } = target
  const charts = selectRenderableAllocationCharts([
    {
      title: i18n.t('ui.hoverallocationpopover.geography'),
      point: allocation.geo,
    },
    {
      title: i18n.t('ui.hoverallocationpopover.assetClass'),
      point: allocation.classe,
    },
    {
      title: i18n.t('ui.hoverallocationpopover.sector'),
      point: allocation.secteur,
    },
    {
      title: i18n.t('ui.hoverallocationpopover.currency'),
      point: allocation.currency,
    },
  ])

  if (charts.length === 0) return null

  const cols = charts.length >= 2 ? 2 : 1

  return (
    <Preview.Content
      anchor={target.buttonRect}
      label={target.name}

      variant="floatingPanel"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      size="wide"
    >
      <Layout overflow="scroll" inset="default">
        <Layout spaceAfter="default">
          <Text as="p" variant="bodyStrong" tone="default" truncate>
            {target.name}
          </Text>
        </Layout>
        <Grid columns={cols} gap="default">
          {charts.map((c) => (
            <MiniDonut key={c.title} title={c.title} point={c.point} />
          ))}
        </Grid>
      </Layout>
    </Preview.Content>
  )
}
