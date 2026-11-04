import { Grid } from '@/shared/ui/layout/Grid.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Skeleton } from '@/shared/ui/Skeleton.view'
import { Surface } from '@/shared/ui/Surface.view'

export function PerformanceSkeleton() {
  return (
    <Stack gap="relaxed">
      <Grid arrangement="pairExtraLarge">
        <MetricGroup />
        <MetricGroup />
      </Grid>
      <Grid arrangement="charts">
        <Skeleton.Chart />
        <Skeleton.Chart />
        <Skeleton.Chart />
      </Grid>
      <Surface variant="card">
        <Stack gap="relaxed">
          <Skeleton.Block variant="title" />
          <Skeleton.Block variant="label" />
          <Skeleton.Block variant="control" />
          <Grid columns={2}>
            <Skeleton.Metric variant="inline" />
            <Skeleton.Metric variant="inline" />
          </Grid>
          <Grid columns={2} gap="spacious">
            <Skeleton.List />
            <Skeleton.List />
          </Grid>
        </Stack>
      </Surface>
    </Stack>
  )
}

function MetricGroup() {
  return (
    <Surface variant="sectionEnd">
      <Stack gap="relaxed">
        <Skeleton.Block variant="label" />
        <Inline as="div" flow="wrap" align="stretch" gap="relaxed">
          <Skeleton.Metric variant="inline" />
          <Skeleton.Metric variant="inline" />
          <Skeleton.Metric variant="inline" />
        </Inline>
      </Stack>
    </Surface>
  )
}
