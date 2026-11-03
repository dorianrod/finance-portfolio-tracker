import type { DiversificationView } from '@/domains/portfolio/features/diversification/shared/types/diversificationView.type'
import { Grid } from '@/shared/ui/layout/Grid.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Skeleton } from '@/shared/ui/Skeleton.view'

export function DiversificationSkeleton({
  view,
}: {
  view: DiversificationView
}) {
  const chartVariant = view === 'current' ? 'donut' : 'cartesian'
  const concentrationArrangement =
    view === 'current' ? 'weightedPairExtraLarge' : 'pairExtraLarge'
  return (
    <Stack gap="relaxed">
      <Inline as="div" align="start" justify="between" gap="default">
        <Stack gap="compact">
          <Skeleton.Block variant="title" />
          <Skeleton.Block variant="label" />
        </Stack>
        <Skeleton.Block variant="control" />
      </Inline>
      <Grid arrangement={concentrationArrangement}>
        <Skeleton.Chart />
        <Skeleton.Chart />
      </Grid>
      <Skeleton.Block variant="title" />
      <Skeleton.Block variant="label" />
      <Grid arrangement="pairExtraLarge">
        <Skeleton.Chart variant={chartVariant} />
        <Skeleton.Chart variant={chartVariant} />
        <Skeleton.Chart variant={chartVariant} />
        <Skeleton.Chart variant={chartVariant} />
      </Grid>
    </Stack>
  )
}
