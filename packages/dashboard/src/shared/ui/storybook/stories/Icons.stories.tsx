import type { Meta, StoryObj } from '@storybook/react-vite'

import { DisclosureChevronIcon } from '@/shared/ui/icons/DisclosureChevronIcon.view'
import { GridIcon } from '@/shared/ui/icons/GridIcon.view'
import { HierarchyIcon } from '@/shared/ui/icons/HierarchyIcon.view'
import { NextIcon } from '@/shared/ui/icons/NextIcon.view'
import { PeriodFilterIcon } from '@/shared/ui/icons/PeriodFilterIcon.view'
import { PieChartIcon } from '@/shared/ui/icons/PieChartIcon.view'
import { TreeChevronIcon } from '@/shared/ui/icons/TreeChevronIcon.view'

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
