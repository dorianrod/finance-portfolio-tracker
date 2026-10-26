import type { FilterScopeSpec } from '@/domains/portfolio/shared/components/filters/FilterScopeBadges.feature'
import { ScopedInfoTooltip } from '@/domains/portfolio/shared/components/kpis/ScopedInfoTooltip.feature'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function EmptyChart({
  title,
  message,
  scope,
}: {
  title: string
  message: string
  scope: FilterScopeSpec
}) {
  return (
    <Surface as="section" variant="panel">
      <Text as="h3" variant="bodyStrong" tone="secondary">
        <Inline as="span" align="center">
          {title}
          <ScopedInfoTooltip text={message} scope={scope} />
        </Inline>
      </Text>
      <Layout height="chart">
        <Text as="div" variant="body" tone="subtle" align="center">
          <Inline as="div" align="center" justify="center">
            {message}
          </Inline>
        </Text>
      </Layout>
    </Surface>
  )
}
