// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { atom, createStore, Provider, useAtomValue } from 'jotai'
import { lazy, useEffect, useMemo, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DashboardPanel } from './DashboardPanel.feature'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('DashboardPanel', () => {
  it('loads a panel only on its first visit, retains its DOM and model, and disconnects hidden effects', async () => {
    const setup = vi.fn()
    const disconnect = vi.fn()
    const calculate = vi.fn(() => 42)
    const user = userEvent.setup()
    function Content() {
      const value = useMemo(calculate, [])
      const [count, setCount] = useState(0)
      useEffect(() => {
        setup()
        return disconnect
      }, [])
      return (
        <button onClick={() => setCount((previous) => previous + 1)}>
          {value}: {count}
        </button>
      )
    }
    const content = <Content />
    const { rerender, unmount } = render(
      <DashboardPanel active={false}>{content}</DashboardPanel>,
    )
    expect(calculate).not.toHaveBeenCalled()
    expect(setup).not.toHaveBeenCalled()

    rerender(<DashboardPanel active>{content}</DashboardPanel>)
    const button = screen.getByRole('button', { name: '42: 0' })
    await user.click(button)
    expect(screen.getByRole('button', { name: '42: 1' })).toBe(button)

    rerender(<DashboardPanel active={false}>{content}</DashboardPanel>)
    expect(screen.queryByRole('button')).toBeNull()
    expect(disconnect).toHaveBeenCalledTimes(1)

    rerender(<DashboardPanel active>{content}</DashboardPanel>)
    expect(screen.getByRole('button', { name: '42: 1' })).toBe(button)
    expect(calculate).toHaveBeenCalledTimes(1)
    expect(setup).toHaveBeenCalledTimes(2)
    unmount()
    expect(disconnect).toHaveBeenCalledTimes(2)
  })

  it('reveals current inputs after they change while the panel is hidden', () => {
    const totalAtom = atom(100)
    const store = createStore()
    function Content() {
      const value = useAtomValue(totalAtom)
      return <output aria-label="Selection total">{value}</output>
    }
    const content = <Content />
    const { rerender } = render(
      <Provider store={store}>
        <DashboardPanel active>{content}</DashboardPanel>
      </Provider>,
    )
    rerender(
      <Provider store={store}>
        <DashboardPanel active={false}>{content}</DashboardPanel>
      </Provider>,
    )
    act(() => store.set(totalAtom, 200))
    rerender(
      <Provider store={store}>
        <DashboardPanel active>{content}</DashboardPanel>
      </Provider>,
    )
    expect(
      screen.getByRole('status', { name: 'Selection total' }).textContent,
    ).toBe('200')
  })

  it('keeps unvisited imports lazy and shows the analysis skeleton during the first download', () => {
    const store = createStore()
    const load = vi.fn(() => new Promise<{ default: () => null }>(() => {}))
    const Pending = lazy(load)
    const content = <Pending />
    const { rerender } = render(
      <Provider store={store}>
        <DashboardPanel active={false}>{content}</DashboardPanel>
      </Provider>,
    )
    expect(load).not.toHaveBeenCalled()
    rerender(
      <Provider store={store}>
        <DashboardPanel active>{content}</DashboardPanel>
      </Provider>,
    )
    expect(load).toHaveBeenCalledTimes(1)
    expect(
      screen.getByRole('status', { name: 'Loading analysis…' }),
    ).toBeTruthy()
  })

  it('isolates failed panels and retries them on the next visit', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    function Content({ broken }: { broken: boolean }) {
      if (broken) throw new Error('Panel failed')
      return <p>Recovered panel</p>
    }
    const healthy = <button>Other analysis</button>
    const { rerender } = render(
      <>
        <DashboardPanel active>
          <Content broken />
        </DashboardPanel>
        <DashboardPanel active={false}>{healthy}</DashboardPanel>
      </>,
    )
    expect(screen.getByRole('alert').textContent).toContain(
      'Unable to load this analysis.',
    )
    rerender(
      <>
        <DashboardPanel active={false}>
          <Content broken={false} />
        </DashboardPanel>
        <DashboardPanel active>{healthy}</DashboardPanel>
      </>,
    )
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole('button', { name: 'Other analysis' })).toBeTruthy()
    rerender(
      <>
        <DashboardPanel active>
          <Content broken={false} />
        </DashboardPanel>
        <DashboardPanel active={false}>{healthy}</DashboardPanel>
      </>,
    )
    expect(screen.getByText('Recovered panel')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Other analysis' })).toBeNull()
  })
})
