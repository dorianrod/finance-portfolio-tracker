import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'
import { expect, fn, waitFor } from 'storybook/test'

import { BUTTON_VARIANTS } from '../../buttonAppearance'
import {
  Button,
  Decorative,
  DecorativeBlock,
  DecorativeSvg,
  DialogButton,
  DisclosureButton,
  Group,
  InlineGroup,
  Input,
  NamedSymbol,
  Navigation,
  NavigationButton,
  Progress,
  Region,
  Select,
  StatusMessage,
  ToggleButton,
} from '../../Controls.view'
import { FIELD_VARIANTS } from '../../fieldAppearance'
import { Surface } from '../../Surface.view'

const meta = {
  title: 'Controls/Buttons and regions',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: Object.keys(BUTTON_VARIANTS) },
  },
} satisfies Meta<typeof Button>
export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    children: 'Open details',
    variant: 'primaryCompact',
    className: 'px-3 py-2',
    onClick: fn(),
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open details' }))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}
export const Variants: Story = {
  render: function Variants() {
    return (
      <div className="flex flex-wrap gap-3">
        {Object.keys(BUTTON_VARIANTS).map((variant) => (
          <Button
            key={variant}
            variant={variant as keyof typeof BUTTON_VARIANTS}
            className="px-3 py-2"
          >
            {variant}
          </Button>
        ))}
      </div>
    )
  },
}
export const Disabled: Story = { args: { ...Playground.args, disabled: true } }
export const Selected: Story = {
  args: { ...Playground.args, variant: 'filter', selected: true },
}
export const Dimmed: Story = { args: { ...Playground.args, dimmed: true } }
export const Toggle: StoryObj<typeof ToggleButton> = {
  args: {
    active: false,
    children: 'Toggle selection',
    variant: 'filter',
    className: 'px-3 py-2',
  },
  render: function Render(args) {
    const [{ active }, updateArgs] = useArgs<typeof args>()
    return (
      <ToggleButton
        {...args}
        active={active}
        onClick={() => updateArgs({ active: !active })}
      />
    )
  },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Toggle selection' })
    await userEvent.click(button)
    await waitFor(() => expect(button).toHaveAttribute('aria-pressed', 'true'))
  },
}
export const DisclosureControl: StoryObj<typeof DisclosureButton> = {
  args: {
    expanded: false,
    children: 'Disclosure button',
    variant: 'secondary',
    className: 'p-2',
  },
  render: function Render(args) {
    return <DisclosureButton {...args} />
  },
}
export const DialogControl: StoryObj<typeof DialogButton> = {
  args: {
    expanded: true,
    children: 'Dialog button',
    variant: 'secondary',
    className: 'p-2',
  },
  render: function Render(args) {
    return <DialogButton {...args} />
  },
}
export const NavigationControl: StoryObj<typeof NavigationButton> = {
  args: {
    active: true,
    children: 'Current view',
    variant: 'tab',
    className: 'p-2',
  },
  render: function Render(args) {
    return <NavigationButton {...args} />
  },
}
export const TextInput: StoryObj<typeof Input> = {
  argTypes: {
    variant: { control: 'select', options: Object.keys(FIELD_VARIANTS) },
  },
  args: {
    label: 'Search examples',
    placeholder: 'Search',
    variant: 'filter',
    className: 'p-2',
  },
  render: function Render(args) {
    return <Input {...args} />
  },
}
export const InputVariants: Story = {
  render: function Variants() {
    return (
      <div className="grid gap-3">
        {Object.keys(FIELD_VARIANTS).map((variant) => (
          <Input
            key={variant}
            label={variant}
            placeholder={variant}
            variant={variant as keyof typeof FIELD_VARIANTS}
            className="p-2"
          />
        ))}
      </div>
    )
  },
}
export const SelectField: StoryObj<typeof Select> = {
  argTypes: {
    variant: { control: 'select', options: Object.keys(FIELD_VARIANTS) },
  },
  args: { label: 'Select period', variant: 'filter', className: 'p-2' },
  render: function Render(args) {
    return (
      <Select {...args}>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </Select>
    )
  },
}
export const LabeledRegions: Story = {
  render: function Regions() {
    return (
      <Region label="Example region">
        <Group label="Actions" className="flex flex-col gap-4">
          <InlineGroup label="Inline choices">InlineGroup content</InlineGroup>
          <Navigation label="Example navigation">
            <NavigationButton active variant="tab">
              Navigation
            </NavigationButton>
          </Navigation>
          <StatusMessage variant="plain">StatusMessage: ready</StatusMessage>
          <StatusMessage urgent tone="negative">
            Urgent message
          </StatusMessage>
          <Progress
            label="Completion"
            value={65}
            variant="track"
            className="h-4 w-64"
          >
            <Surface variant="accentFill" className="h-full w-[65%]" />
          </Progress>
          <Decorative tone="accent">Decorative text</Decorative>
          <DecorativeBlock variant="raised" className="h-4 w-24" />
          <NamedSymbol label="Trend increasing">↗</NamedSymbol>
          <DecorativeSvg viewBox="0 0 20 20" className="size-5">
            <circle cx="10" cy="10" r="8" fill="currentColor" />
          </DecorativeSvg>
        </Group>
      </Region>
    )
  },
}
