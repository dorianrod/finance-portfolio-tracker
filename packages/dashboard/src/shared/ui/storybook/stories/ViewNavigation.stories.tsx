import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'

import { Inset } from '@/shared/ui/layout/Inset.view'
import { SegmentedControl } from '@/shared/ui/segmentedControl/SegmentedControl.view'

import { ViewNavigation } from '../../ViewNavigation.view'

const meta = {
  title: 'Navigation/ViewNavigation',
  component: ViewNavigation,
} satisfies Meta<typeof ViewNavigation>
export default meta

type Args = Omit<React.ComponentProps<typeof ViewNavigation>, 'className'> & {
  selected: string
}
export const Playground: StoryObj<Args> = {
  args: { selected: 'grid', children: null },
  render: function Render() {
    const [{ selected }, updateArgs] = useArgs<Args>()
    return (
      <ViewNavigation>
        <SegmentedControl label="Presentation">
          <ViewNavigation.Item
            value="grid"
            active={selected === 'grid'}
            onClick={() => updateArgs({ selected: 'grid' })}
          >
            Grid
          </ViewNavigation.Item>
          <ViewNavigation.Item
            value="list"
            active={selected === 'list'}
            onClick={() => updateArgs({ selected: 'list' })}
          >
            List
          </ViewNavigation.Item>
        </SegmentedControl>
        <ViewNavigation.Panel value="grid" hidden={selected !== 'grid'}>
          <Inset inset="default">Grid presentation</Inset>
        </ViewNavigation.Panel>
        <ViewNavigation.Panel value="list" hidden={selected !== 'list'}>
          <Inset inset="default">List presentation</Inset>
        </ViewNavigation.Panel>
      </ViewNavigation>
    )
  },
}
