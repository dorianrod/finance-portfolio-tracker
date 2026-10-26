import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'

import { SegmentedControl } from '../../SegmentedControl.view'
import { ViewNavigation } from '../../ViewNavigation.view'

const meta = {
  title: 'Navigation/ViewNavigation',
  component: ViewNavigation,
} satisfies Meta<typeof ViewNavigation>
export default meta

type Args = React.ComponentProps<typeof ViewNavigation> & { selected: string }
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
        <ViewNavigation.Panel
          value="grid"
          hidden={selected !== 'grid'}
          className="p-4"
        >
          Grid presentation
        </ViewNavigation.Panel>
        <ViewNavigation.Panel
          value="list"
          hidden={selected !== 'list'}
          className="p-4"
        >
          List presentation
        </ViewNavigation.Panel>
      </ViewNavigation>
    )
  },
}
