import type { Meta, StoryObj } from '@storybook/react-vite'
import { useArgs } from 'storybook/preview-api'

import { Input } from '@/shared/ui/controls/Input.view'
import { ChoiceRow } from '@/shared/ui/formElements/ChoiceRow.view'
import { FieldSeparator } from '@/shared/ui/formElements/FieldSeparator.view'
import { FilterIcon } from '@/shared/ui/formElements/FilterIcon.view'
import { SelectionFrame } from '@/shared/ui/formElements/SelectionFrame.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { Layout } from '@/shared/ui/layout/Layout.view'

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
            <Inline as="span" align="center" gap="default" inset="compact">
              <Checkbox
                checked={selected}
                onChange={(event) =>
                  updateArgs({ selected: event.target.checked })
                }
              />
              Select this example
            </Inline>
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
          <Layout as="span" flow="block" inset="default">
            <input type="radio" name="choice" defaultChecked /> Default choice
          </Layout>
        </ChoiceRow>
        <ChoiceRow variant="nested">
          <Layout as="span" flow="block" inset="default">
            <input type="radio" name="choice" /> Nested choice
          </Layout>
        </ChoiceRow>
        <ChoiceRow variant="card">
          <Layout as="span" flow="block" inset="default">
            <input type="radio" name="choice" /> Card choice
          </Layout>
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
