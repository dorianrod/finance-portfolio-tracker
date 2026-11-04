import type { ChartTone } from '@/shared/theme/chartColors/chartColors.types'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SeriesSwatch } from '@/shared/ui/swatch/SeriesSwatch.view'

export function ChartLegendItem({
  tone,
  label,
}: {
  tone: ChartTone
  label: string
}) {
  return (
    <Inline as="span" align="center" gap="compact">
      <Layout as="span" flow="inline" height="divider" width="icon">
        <SeriesSwatch shape="softDot" tone={tone} />
      </Layout>
      {label}
    </Inline>
  )
}
