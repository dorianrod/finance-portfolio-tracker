import type { ReactNode } from 'react'

import { Decorative } from '@/shared/ui/controls/Decorative.view'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'

export function PositionBreakdownView({
  hasAllocation,
  hasUnderlying,
  children,
}: {
  hasAllocation: boolean
  hasUnderlying: boolean
  children: ReactNode
}) {
  const hasNoBreakdown = !hasAllocation && !hasUnderlying
  return (
    <Grid as="span" columns={2} placement="inset" gap="compact">
      {children}
      {hasNoBreakdown && (
        <Layout as="span" flow="block" placement="overlay">
          <Surface variant="overlay" as="span" tone="subtle">
            <Inline as="span" align="center" justify="center">
              —
            </Inline>
          </Surface>
        </Layout>
      )}
    </Grid>
  )
}

function BreakdownSlot({
  available,
  children,
}: {
  available: boolean
  children: ReactNode
}) {
  if (available) return children
  return (
    <Layout as="span" flow="inline" width="icon" height="icon">
      <Decorative>
        <Layout as="span" flow="block" />
      </Decorative>
    </Layout>
  )
}

PositionBreakdownView.Slot = BreakdownSlot
