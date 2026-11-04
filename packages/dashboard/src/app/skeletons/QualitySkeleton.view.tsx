import { Grid } from '@/shared/ui/layout/Grid.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Stack } from '@/shared/ui/layout/Stack.view'
import { Skeleton } from '@/shared/ui/Skeleton.view'
import { Surface } from '@/shared/ui/Surface.view'

export function QualitySkeleton() {
  return (
    <Grid arrangement="sidebar" align="start">
      <Stack gap="compact" inset="default">
        <Skeleton.Block variant="control" />
        <Skeleton.Block variant="control" />
        <Skeleton.Block variant="control" />
        <Skeleton.Block variant="control" />
      </Stack>
      <Stack gap="relaxed">
        <Surface variant="sectionEnd">
          <Inline
            as="div"
            flow="wrap"
            align="start"
            justify="between"
            gap="relaxed"
            inset="default"
          >
            <Stack gap="default">
              <Skeleton.Block variant="title" />
              <Skeleton.Block variant="label" />
            </Stack>
            <Layout>
              <Skeleton.Block variant="value" />
            </Layout>
          </Inline>
        </Surface>
        <Skeleton.Table columns={4} />
      </Stack>
    </Grid>
  )
}
