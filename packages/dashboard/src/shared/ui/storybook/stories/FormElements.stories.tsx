import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'

import { Checkbox } from '../../Checkbox.view'
import { Input } from '../../Controls.view'
import {
  ChoiceRow,
  FieldSeparator,
  FilterIcon,
  SelectionFrame,
} from '../../FormElements.view'

const meta = {
  title: 'Controls/Form composition',
  component: SelectionFrame,
  args: { selected: false },
} satisfies Meta<typeof SelectionFrame>
export default meta
type Story = StoryObj<typeof meta>

export const Selection: Story = {
  args: { selected: false },
  render: function Render(args) {
    const [{ selected }, updateArgs] = useArgs<typeof args>()
    return (
      <SelectionFrame {...args} selected={selected} className="p-3">
        <ChoiceRow className="flex items-center gap-2 p-2">
          <Checkbox
            checked={selected}
            onChange={(event) => updateArgs({ selected: event.target.checked })}
          />
          Select this example
        </ChoiceRow>
      </SelectionFrame>
    )
  },
}
export const Selected: Story = { ...Selection, args: { selected: true } }
export const ChoiceRows: Story = {
  render: function Choices() {
    return (
      <div className="grid gap-2">
        <ChoiceRow variant="default" className="p-3">
          <input type="radio" name="choice" defaultChecked /> Default choice
        </ChoiceRow>
        <ChoiceRow variant="nested" className="p-3">
          <input type="radio" name="choice" /> Nested choice
        </ChoiceRow>
        <ChoiceRow variant="card" className="p-3">
          <input type="radio" name="choice" /> Card choice
        </ChoiceRow>
      </div>
    )
  },
}
export const DateRange: Story = {
  render: function Range() {
    return (
      <div className="flex items-center gap-3">
        <FilterIcon className="size-5" />
        <Input label="Start date" type="date" defaultValue="2025-01-01" />
        <FieldSeparator />
        <Input label="End date" type="date" defaultValue="2025-12-31" />
      </div>
    )
  },
}
