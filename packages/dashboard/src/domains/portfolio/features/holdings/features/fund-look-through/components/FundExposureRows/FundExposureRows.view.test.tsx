// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SourcesCell } from '@/domains/portfolio/features/holdings/features/fund-look-through/components/FundExposureRows/fundExposureRows/SourcesCell.view'
import { exposureSource } from '@/domains/portfolio/features/holdings/features/fund-look-through/mocks/exposureSource.mock'
import type { ExposureSource } from '@/domains/portfolio/features/holdings/features/fund-look-through/types/issuerExposure.type'
import { SidePanel } from '@/shared/ui/SidePanel.view'

const SOURCES: ExposureSource[] = [
  exposureSource({ fund: 'First fund', value: 60 }),
  exposureSource({ fund: 'Second fund', value: 40 }),
]

afterEach(cleanup)

describe('SourcesCell', () => {
  it('associates its tooltip with the trigger and handles Escape before the dialog', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <SidePanel open closeLabel="Close details" onClose={onClose}>
        <SidePanel.Title>Exposure</SidePanel.Title>
        <SourcesCell sources={SOURCES} total={100} empty="Direct" compact />
      </SidePanel>,
    )
    const trigger = screen.getByRole('button', { name: '2 sources' })
    await user.click(trigger)
    expect(trigger.getAttribute('aria-describedby')).toBe(
      screen.getByRole('tooltip').id,
    )
    expect(screen.getByText('Held through 2 sources')).toBeTruthy()
    await user.hover(screen.getByRole('heading', { name: 'Exposure' }))
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
    { sources: [exposureSource({ fund: null })], expected: 'Direct' },
  ])(
    'renders $expected without a nonfunctional trigger',
    ({ sources, expected }) => {
      render(
        <SourcesCell sources={sources} total={100} empty="Direct" compact />,
      )
      expect(screen.getByText(expected)).toBeTruthy()
      expect(screen.queryByRole('button')).toBeNull()
      expect(screen.queryByRole('tooltip')).toBeNull()
    },
  )

  it('renders separate contributions when a fund shares the direct-holding label', async () => {
    const user = userEvent.setup()
    render(
      <SourcesCell
        sources={[
          exposureSource({ fund: 'Direct', value: 60 }),
          exposureSource({ fund: null, value: 40 }),
        ]}
        total={100}
        empty="Unavailable"
      />,
    )

    await user.click(screen.getByRole('button', { name: '2 sources' }))
    expect(screen.getAllByText('Direct')).toHaveLength(2)
    expect(screen.getByText('60%')).toBeTruthy()
    expect(screen.getByText('40%')).toBeTruthy()
  })
})
