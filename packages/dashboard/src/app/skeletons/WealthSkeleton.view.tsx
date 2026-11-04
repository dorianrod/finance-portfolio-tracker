import { Grid } from '@/shared/ui/layout/Grid.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Skeleton } from '@/shared/ui/Skeleton.view'
import { Surface } from '@/shared/ui/Surface.view'

export function WealthSkeleton() {
  return (
    <Stack gap="relaxed">
      <Surface variant="sectionEnd">
        <Inline as="div" flow="wrap" align="stretch" gap="relaxed">
          <Skeleton.Metric variant="inline" />
          <Skeleton.Metric variant="inline" />
        </Inline>
      </Surface>
      <Grid arrangement="pairExtraLarge">
        <Skeleton.Chart />
        <Skeleton.Chart variant="donut" />
        <Skeleton.Chart />
        <Skeleton.Chart />
        <Skeleton.Chart />
        <Skeleton.Chart />
      </Grid>
      <Skeleton.Chart />
    </Stack>
  )
}
