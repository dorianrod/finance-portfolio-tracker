// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { Activity, StrictMode } from 'react'
import { createPortal } from 'react-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useOverlayPortal } from './useOverlayPortal'

afterEach(cleanup)

function Content({
  open,
  onDismiss,
}: {
  open: boolean
  onDismiss: () => void
}) {
  const container = useOverlayPortal(open, onDismiss)
  return container && createPortal(<button>Overlay action</button>, container)
}

describe('overlay portal lifecycle', () => {
  it('removes a hidden portal synchronously and dismisses it with the latest callback', async () => {
    const previous = vi.fn()
    const latest = vi.fn()
    const { rerender } = render(
      <Activity mode="visible">
        <div>
          <Content open onDismiss={previous} />
        </div>
      </Activity>,
    )
    expect(screen.getByRole('button', { name: 'Overlay action' })).toBeTruthy()
    rerender(
      <Activity mode="visible">
        <div>
          <Content open onDismiss={latest} />
        </div>
      </Activity>,
    )
    expect(latest).not.toHaveBeenCalled()
    rerender(
      <Activity mode="hidden">
        <div>
          <Content open onDismiss={latest} />
        </div>
      </Activity>,
    )
    expect(screen.queryByRole('button', { name: 'Overlay action' })).toBeNull()
    await waitFor(() => expect(latest).toHaveBeenCalledOnce())
    expect(previous).not.toHaveBeenCalled()
  })

  it('does not dismiss on StrictMode replay or ordinary controlled closure', async () => {
    const dismiss = vi.fn()
    const { rerender } = render(
      <StrictMode>
        <Content open onDismiss={dismiss} />
      </StrictMode>,
    )
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Overlay action' }),
      ).toBeTruthy(),
    )
    expect(dismiss).not.toHaveBeenCalled()
    rerender(
      <StrictMode>
        <Content open={false} onDismiss={dismiss} />
      </StrictMode>,
    )
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Overlay action' }),
      ).toBeNull(),
    )
    expect(dismiss).not.toHaveBeenCalled()
  })
})
