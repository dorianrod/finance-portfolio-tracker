// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { indexFundStatuses } from '@/domains/portfolio/features/holdings/features/positions/helpers/transformers/indexFundStatuses'
import { makePositionPreviewSelection } from '@/domains/portfolio/features/holdings/features/positions/mocks/positionPreviewSelection.mock'
import type { IsinAllocation } from '@/domains/portfolio/features/holdings/features/positions/types/isinAllocation.type'
import { makeFundHoldingStatus } from '@/domains/portfolio/shared/mocks/fundHoldingStatus.mock'
import { makePosition } from '@/domains/portfolio/shared/mocks/position.mock'
import type { FundHoldingStatus } from '@/domains/portfolio/shared/types/fundHoldingStatus.type'
import type { PositionRow } from '@/domains/portfolio/shared/types/positionRow.type'

import { usePositionPreviewActions } from './actions/usePositionPreviewActions'
import { usePositionTableOverlays } from './usePositionTableOverlays'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function setup() {
  const store = createStore()
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }
  const initialProps: Input = {
    positions: [makePosition()],
    statuses: [],
    allocations: new Map(),
  }
  const mount = () =>
    renderHook(
      ({ positions, statuses, allocations }: Input) => ({
        ...usePositionTableOverlays(
          positions,
          indexFundStatuses(statuses),
          allocations,
        ),
        ...usePositionPreviewActions(),
      }),
      { wrapper: Wrapper, initialProps },
    )
  return { mount, initialProps }
}

type Input = {
  positions: PositionRow[]
  statuses: FundHoldingStatus[]
  allocations: Map<string, IsinAllocation>
}

describe('usePositionTableOverlays', () => {
  it('opens and dismisses a chart preview', () => {
    const { mount } = setup()
    const { result } = mount()
    act(() => result.current.showPreview(makePositionPreviewSelection()))
    expect(result.current.preview).toMatchObject({
      kind: 'chart',
      target: { name: 'Asset', isin: 'FR0000000001' },
    })
    act(() => result.current.dismiss())
    expect(result.current.preview).toBeNull()
  })

  it('cancels delayed dismissal and clears the selection on unmount', () => {
    vi.useFakeTimers()
    const { mount } = setup()
    const first = mount()
    act(() => {
      first.result.current.showPreview(makePositionPreviewSelection())
      first.result.current.scheduleHide()
      first.result.current.cancelHide()
      vi.runAllTimers()
    })
    expect(first.result.current.preview?.kind).toBe('chart')
    first.unmount()
    expect(mount().result.current.preview).toBeNull()
  })

  it('dismisses a preview when its timer expires', () => {
    vi.useFakeTimers()
    const { result } = setup().mount()
    act(() => {
      result.current.showPreview(makePositionPreviewSelection())
      result.current.scheduleHide()
      vi.runAllTimers()
    })
    expect(result.current.preview).toBeNull()
  })

  it('updates an open target from the latest positions and fund statuses', () => {
    const { mount, initialProps } = setup()
    const original = makeFundHoldingStatus({ sourceName: 'Original source' })
    const { result, rerender } = mount()
    rerender({ ...initialProps, statuses: [original] })
    act(() =>
      result.current.showPreview(
        makePositionPreviewSelection({ kind: 'underlying' }),
      ),
    )
    expect(result.current.preview).toMatchObject({
      target: { status: { sourceName: 'Original source' } },
    })
    rerender({
      ...initialProps,
      positions: [makePosition({ name: 'Updated asset' })],
      statuses: [{ ...original, sourceName: 'Updated source' }],
    })
    expect(result.current.preview).toMatchObject({
      target: {
        position: { name: 'Updated asset' },
        status: { sourceName: 'Updated source' },
      },
    })
  })

  it('clears a removed target without reopening when that position returns', () => {
    const { mount, initialProps } = setup()
    const { result, rerender } = mount()
    act(() => result.current.showPreview(makePositionPreviewSelection()))
    rerender({ ...initialProps, positions: [] })
    expect(result.current.preview).toBeNull()
    rerender(initialProps)
    expect(result.current.preview).toBeNull()
  })

  it('keeps selections isolated between stores', () => {
    const first = setup().mount()
    const second = setup().mount()
    act(() => first.result.current.showPreview(makePositionPreviewSelection()))
    expect(second.result.current.preview).toBeNull()
  })
})
