// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Button } from '@/shared/ui/controls/Button.view'

import { MetricCard } from './MetricCard.view'

afterEach(cleanup)

describe('MetricCard', () => {
  it('keeps the drill-down button separate from nested header actions', async () => {
    const onOpen = vi.fn(),
      onInfo = vi.fn()
    render(
      <MetricCard accent={'highlight'} label="Open summary" onOpen={onOpen}>
        <MetricCard.Header>
          Summary
          <MetricCard.Action>
            <Button label="More information" onClick={onInfo}>
              i
            </Button>
          </MetricCard.Action>
        </MetricCard.Header>
        <MetricCard.Body>42</MetricCard.Body>
      </MetricCard>,
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'More information' }))
    expect(onInfo).toHaveBeenCalledOnce()
    expect(onOpen).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Open summary' }))
    expect(onOpen).toHaveBeenCalledOnce()
    expect(screen.getByText('42')).toBeTruthy()
  })
})
