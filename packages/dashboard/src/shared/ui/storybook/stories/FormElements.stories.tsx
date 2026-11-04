import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'

import { Input } from '@/shared/ui/controls/Input.view'
import { ChoiceRow } from '@/shared/ui/formElements/ChoiceRow.view'
import { FieldSeparator } from '@/shared/ui/formElements/FieldSeparator.view'
import { FilterIcon } from '@/shared/ui/formElements/FilterIcon.view'
import { SelectionFrame } from '@/shared/ui/formElements/SelectionFrame.view'
import { Inset } from '@/shared/ui/layout/Inset.view'

import { Checkbox } from '../../Checkbox.view'

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
      <SelectionFrame {...args} selected={selected}>
        <Inset inset="default">
          <ChoiceRow>
            <Checkbox
              checked={selected}
              onChange={(event) =>
                updateArgs({ selected: event.target.checked })
              }
            />
            Select this example
          </ChoiceRow>
        </Inset>
      </SelectionFrame>
    )
  },
}
export const Selected: Story = { ...Selection, args: { selected: true } }
export const ChoiceRows: Story = {
  render: function Choices() {
    return (
      <div className="grid gap-2">
        <ChoiceRow variant="default">
          <input type="radio" name="choice" defaultChecked /> Default choice
        </ChoiceRow>
        <ChoiceRow variant="nested">
          <input type="radio" name="choice" /> Nested choice
        </ChoiceRow>
        <ChoiceRow variant="card">
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
        <FilterIcon />
        <Input label="Start date" type="date" defaultValue="2025-01-01" />
        <FieldSeparator />
        <Input label="End date" type="date" defaultValue="2025-12-31" />
      </div>
    )
  },
}
