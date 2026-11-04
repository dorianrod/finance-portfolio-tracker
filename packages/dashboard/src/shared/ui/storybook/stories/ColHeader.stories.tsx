import type { Meta, StoryObj } from '@storybook/react-vite'

import { ColHeader } from '../../ColHeader.view'

const meta = { title: 'Tables/ColHeader', component: ColHeader } satisfies Meta<
  typeof ColHeader
>
export default meta
type Story = StoryObj<typeof meta>

export const Information: Story = {
  args: {
    label: 'Value',
    columnName: 'Market value',
    content: 'The fictional market value at the end of the period.',
  },
}
