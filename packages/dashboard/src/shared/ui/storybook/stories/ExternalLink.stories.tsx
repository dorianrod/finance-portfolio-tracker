import type { Meta, StoryObj } from '@storybook/react-vite'

import { ExternalLink } from '../../ExternalLink.view'

const meta = {
  title: 'Typography/ExternalLink',
  component: ExternalLink,
} satisfies Meta<typeof ExternalLink>
export default meta
type Story = StoryObj<typeof meta>

export const Source: Story = {
  args: {
    href: 'https://example.com/report',
    variant: 'source',
    children: 'View source report',
  },
  render: function Render(args) {
    return <ExternalLink {...args} />
  },
}
export const InvalidUrl: Story = {
  args: { href: 'invalid-url', children: 'Unavailable source (plain text)' },
}
export const Truncated: Story = {
  args: {
    ...Source.args,
    children: 'A long source report title that exceeds its container',
    truncate: true,
  },
}
