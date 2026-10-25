// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SidePanel } from '@/shared/ui/SidePanel.view'

import { SourcesCell } from './FundExposureRows.view'

const SOURCES = [
  { fund: 'First fund', value: 60 },
  { fund: 'Second fund', value: 40 },
]

afterEach(cleanup)

describe('SourcesCell', () => {
  it('associates its tooltip with the trigger and handles Escape before the dialog', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <SidePanel open closeLabel="Close details" onClose={onClose}>
        <SidePanel.Title>Exposure</SidePanel.Title>
        <SourcesCell
          sources={SOURCES}
          total={100}
          empty="Direct"
          className=""
        />
      </SidePanel>,
    )
    const trigger = screen.getByRole('button', { name: '2 funds' })
    await user.click(trigger)
    expect(trigger.getAttribute('aria-describedby')).toBe(
      screen.getByRole('tooltip').id,
    )
    expect(screen.getByText('Held through 2 funds')).toBeTruthy()
    await user.unhover(trigger)
    expect(screen.getByRole('tooltip')).toBeTruthy()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(document.activeElement).toBe(trigger)
    expect(onClose).not.toHaveBeenCalled()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it.each([
    { sources: [], expected: 'Direct' },
    { sources: [SOURCES[0]], expected: 'First fund' },
  ])(
    'renders $expected without a nonfunctional trigger',
    ({ sources, expected }) => {
      render(
        <SourcesCell
          sources={sources}
          total={100}
          empty="Direct"
          className=""
        />,
      )
      expect(screen.getByText(expected)).toBeTruthy()
      expect(screen.queryByRole('button')).toBeNull()
      expect(screen.queryByRole('tooltip')).toBeNull()
    },
  )
})
