// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { QualityIndicatorCard } from '@/domains/portfolio/shared/components/quality/QualityIndicatorCard.view'
import { SidePanel } from '@/shared/ui/SidePanel.view'

import { InfoTooltip } from './InfoTooltip.view'
import { Kpi } from './Kpi.view'

afterEach(cleanup)

describe('composed information tooltips', () => {
  it.each([
    {
      name: 'KPI label',
      element: (
        <Kpi.Label tooltip="Calculation details">
          Portfolio value
          <Kpi.TooltipFooter>
            <span>Selected accounts</span>
          </Kpi.TooltipFooter>
        </Kpi.Label>
      ),
    },
    {
      name: 'quality card',
      element: (
        <QualityIndicatorCard
          label="Coverage"
          tooltip="Calculation details"
          amount={100}
          percentage={50}
        >
          <QualityIndicatorCard.TooltipFooter>
            <span>Selected accounts</span>
          </QualityIndicatorCard.TooltipFooter>
          <p>Additional details</p>
        </QualityIndicatorCard>
      ),
    },
  ])(
    'shows the $name footer only inside its open tooltip',
    async ({ element }) => {
      const user = userEvent.setup()
      render(element)
      expect(screen.queryByText('Selected accounts')).toBeNull()
      const trigger = screen.getByRole('button')
      await user.click(trigger)
      const tooltip = screen.getByRole('tooltip')
      expect(within(tooltip).getByText('Calculation details')).toBeTruthy()
      expect(within(tooltip).getAllByText('Selected accounts')).toHaveLength(1)
      expect(screen.getAllByText('Selected accounts')).toHaveLength(1)
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('tooltip')).toBeNull()
      expect(trigger.getAttribute('aria-describedby')).toBeNull()
    },
  )

  it('keeps the quality card body and progress indicator outside the tooltip', () => {
    render(
      <QualityIndicatorCard
        label="Coverage"
        tooltip="Calculation details"
        amount={100}
        percentage={50}
      >
        <p>Additional details</p>
      </QualityIndicatorCard>,
    )
    expect(screen.getByText('Additional details')).toBeTruthy()
    expect(
      screen
        .getByRole('progressbar', { name: 'Coverage' })
        .getAttribute('aria-valuenow'),
    ).toBe('50')
  })

  it('omits the scope section when no footer is composed', async () => {
    const user = userEvent.setup()
    render(<InfoTooltip text="Calculation details" />)
    await user.click(screen.getByRole('button'))
    expect(screen.getByRole('tooltip').textContent).toBe('Calculation details')
  })

  it('keeps a focused tooltip open when the pointer leaves', async () => {
    const user = userEvent.setup()
    render(<InfoTooltip text="Calculation details" />)
    const trigger = screen.getByRole('button')
    await user.hover(trigger)
    await user.click(trigger)
    await user.unhover(trigger)
    expect(screen.getByRole('tooltip').textContent).toBe('Calculation details')
    expect(document.activeElement).toBe(trigger)
  })

  it('dismisses the tooltip before its dialog and preserves keyboard focus', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <SidePanel open closeLabel="Close details" onClose={onClose}>
        <SidePanel.Title>Details</SidePanel.Title>
        <InfoTooltip text="Calculation details" />
      </SidePanel>,
    )
    const trigger = screen.getByRole('button', { name: 'More information' })
    await user.click(trigger)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(document.activeElement).toBe(trigger)
    expect(onClose).not.toHaveBeenCalled()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })
})
