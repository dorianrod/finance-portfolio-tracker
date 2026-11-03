import type { Meta, StoryObj } from '@storybook/react-vite'

import { Grid } from '../../layout/Grid.view'
import { Stack } from '../../layout/Stack.view'
import { Skeleton } from '../../Skeleton.view'

const meta = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  args: { label: 'Loading analysis…', children: null },
} satisfies Meta<typeof Skeleton>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <Skeleton {...args}>
      <Stack gap="relaxed">
        <Skeleton.Block variant="title" />
        <Grid columns={4}>
          <Skeleton.Metric />
          <Skeleton.Metric />
          <Skeleton.Metric variant="inline" />
          <Skeleton.Metric variant="inline" />
        </Grid>
        <Grid columns={2}>
          <Skeleton.Chart />
          <Skeleton.Chart variant="donut" />
        </Grid>
        <Skeleton.Table />
        <Skeleton.List />
      </Stack>
    </Skeleton>
  ),
}
