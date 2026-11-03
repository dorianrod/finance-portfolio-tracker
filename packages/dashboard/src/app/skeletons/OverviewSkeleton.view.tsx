import { Grid } from '@/shared/ui/layout/Grid.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Skeleton } from '@/shared/ui/Skeleton.view'

export function OverviewSkeleton() {
  return (
    <Stack gap="relaxed">
      <Grid columns={4} gap="default">
        <Skeleton.Metric />
        <Skeleton.Metric />
        <Skeleton.Metric />
        <Skeleton.Metric />
      </Grid>
      <Grid arrangement="pairExtraLarge">
        <Skeleton.Chart />
        <Skeleton.Chart />
        <Skeleton.Chart />
      </Grid>
    </Stack>
  )
}
