import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  DisclosureChevronIcon,
  GridIcon,
  HierarchyIcon,
  NextIcon,
  PeriodFilterIcon,
  PieChartIcon,
  TreeChevronIcon,
} from '../../Icons.view'

const meta = { title: 'Icons/Gallery', component: GridIcon } satisfies Meta<
  typeof GridIcon
>
export default meta
type Story = StoryObj<typeof meta>

export const Gallery: Story = {
  render: function Gallery() {
    return (
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <div>
          GridIcon
          <GridIcon />
        </div>
        <div>
          NextIcon
          <NextIcon />
        </div>
        <div>
          HierarchyIcon
          <HierarchyIcon />
        </div>
        <div>
          PieChartIcon
          <PieChartIcon />
        </div>
        <div>
          PeriodFilterIcon
          <PeriodFilterIcon />
        </div>
        <div>
          DisclosureChevronIcon
          <DisclosureChevronIcon expanded={false} />
          <DisclosureChevronIcon expanded />
        </div>
        <div>
          TreeChevronIcon
          <TreeChevronIcon expanded={false} />
          <TreeChevronIcon expanded />
        </div>
      </div>
    )
  },
}
