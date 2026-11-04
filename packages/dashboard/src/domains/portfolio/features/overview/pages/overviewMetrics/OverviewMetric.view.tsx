import type { ReactNode } from 'react'

import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'
import { Tooltip } from '@/shared/ui/Tooltip.view'

export function OverviewMetric({
  label,
  value,
  children,
  previousValue,
}: {
  label?: string
  value: string
  children: ReactNode
  previousValue: string
}) {
  const previousLabel = i18n.t('ui.overviewsummarycards.previousValue', {
    value: previousValue,
  })
  return (
    <Stack as="span" gap="none">
      {label != null && (
        <Text variant="micro" tone="subtle">
          {label}
        </Text>
      )}
      <Inline as="span" align="baseline" justify="between" gap="compact">
        <Text
          variant={label == null ? 'metricSecondary' : 'bodyStrong'}
          tone="default"
          numeric
        >
          {value}
        </Text>
        <Surface as="span" variant="interactiveOverlay">
          <Tooltip>
            <Tooltip.Trigger label={previousLabel}>{children}</Tooltip.Trigger>
            <Tooltip.Content side="top">{previousLabel}</Tooltip.Content>
          </Tooltip>
        </Surface>
      </Inline>
    </Stack>
  )
}

function OverviewSecondaryMetric({
  label,
  value,
  children,
}: {
  label: string
  value: string
  children?: ReactNode
}) {
  return (
    <Inline as="span" align="baseline" justify="between" gap="compact">
      <Text variant="micro" tone="subtle">
        <Inline as="span" gap="compact">
          {label}
          {children}
        </Inline>
      </Text>
      <Text variant="bodyStrong" tone="default" numeric>
        {value}
      </Text>
    </Inline>
  )
}

OverviewMetric.Secondary = OverviewSecondaryMetric
