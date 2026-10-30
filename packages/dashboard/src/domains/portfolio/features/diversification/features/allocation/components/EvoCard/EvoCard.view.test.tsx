// @vitest-environment jsdom
import '@/i18n/i18n'

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { makeAllocationPoint } from '@/domains/portfolio/shared/mocks/allocationPoint.mock'

import { EvoCardView } from './EvoCard.view'
import { buildAllocationTrend } from './helpers/presenters/buildAllocationTrend'

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 600, 200),
  )
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {
        return undefined
      }
      unobserve() {
        return undefined
      }
      disconnect() {
        return undefined
      }
    },
  )
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('EvoCardView', () => {
  it('shows literal category values during keyboard chart exploration', async () => {
    const user = userEvent.setup()
    const point = makeAllocationPoint({
      categories: [
        { name: 'A.with.dot', value: 60 },
        { name: 'date', value: 40 },
      ],
    })
    render(
      <EvoCardView
        title="Allocation"
        trend={buildAllocationTrend([point])}
        dateDomain={[point.date.getTime(), point.date.getTime()]}
        activeCategory={null}
        isFiltered={false}
        onSelect={vi.fn()}
      >
        {null}
      </EvoCardView>,
    )
    await user.tab()
    await user.tab()
    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('application'))
    await user.keyboard('{ArrowRight}')
    expect(await screen.findByText('A.with.dot: 60.0%')).toBeDefined()
    expect(screen.getByText('date: 40.0%')).toBeDefined()
  })
  it('keeps a real category selectable when its name matches the aggregate label', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const point = makeAllocationPoint({
      categories: [
        { name: 'others (3)', value: 97 },
        { name: 'Energy', value: 1 },
        { name: 'Health', value: 1 },
        { name: 'Utilities', value: 1 },
      ],
    })
    render(
      <EvoCardView
        title="Allocation"
        trend={buildAllocationTrend([point])}
        dateDomain={[point.date.getTime(), point.date.getTime()]}
        activeCategory={null}
        isFiltered={false}
        onSelect={onSelect}
      >
        {null}
      </EvoCardView>,
    )
    expect(screen.getAllByRole('button', { name: 'others (3)' })).toHaveLength(
      1,
    )
    expect(screen.getAllByText('others (3)')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'others (3)' }))
    expect(onSelect).toHaveBeenCalledExactlyOnceWith('others (3)')
  })
})
