// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SegmentedControl } from '@/shared/ui/segmentedControl/SegmentedControl.view'
import { SegmentedControlItem } from '@/shared/ui/segmentedControl/SegmentedControlItem.view'

afterEach(cleanup)

describe('SegmentedControl', () => {
  it('exposes a named group, selected values and option actions', async () => {
    const user = userEvent.setup()
    const selectPercentage = vi.fn()
    render(
      <SegmentedControl label="Chart scale">
        <SegmentedControlItem active>Value</SegmentedControlItem>
        <SegmentedControlItem active={false} onClick={selectPercentage}>
          Percentage
        </SegmentedControlItem>
      </SegmentedControl>,
    )

    const group = within(screen.getByRole('group', { name: 'Chart scale' }))
    expect(
      group.getByRole('button', { name: 'Value', pressed: true }),
    ).toBeTruthy()
    await user.click(
      group.getByRole('button', { name: 'Percentage', pressed: false }),
    )
    expect(selectPercentage).toHaveBeenCalledOnce()
  })
})
