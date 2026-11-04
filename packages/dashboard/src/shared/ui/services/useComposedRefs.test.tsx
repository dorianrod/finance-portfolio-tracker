// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { createRef, type Ref, StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useComposedRefs } from './useComposedRefs'

afterEach(cleanup)

function Field({
  first,
  second,
}: {
  first?: Ref<HTMLInputElement>
  second?: Ref<HTMLInputElement>
}) {
  const ref = useComposedRefs(first, second)
  return <input ref={ref} aria-label="Draft" />
}

describe('composed refs', () => {
  it('preserves the element when refs change and clears both object refs on unmount', () => {
    const first = createRef<HTMLInputElement>()
    const second = createRef<HTMLInputElement>()
    const replacement = createRef<HTMLInputElement>()
    const { rerender, unmount } = render(
      <Field first={first} second={second} />,
    )
    const field = screen.getByRole('textbox', { name: 'Draft' })
    expect(first.current).toBe(field)
    expect(second.current).toBe(field)
    rerender(<Field first={first} second={replacement} />)
    expect(screen.getByRole('textbox', { name: 'Draft' })).toBe(field)
    expect(first.current).toBe(field)
    expect(second.current).toBeNull()
    expect(replacement.current).toBe(field)
    unmount()
    expect(first.current).toBeNull()
    expect(replacement.current).toBeNull()
  })

  it('honors React 19 callback cleanups and legacy null callbacks in Strict Mode', () => {
    const onCleanup = vi.fn()
    const cleanupRef = vi.fn(() => onCleanup)
    const legacyRef = vi.fn()
    const { unmount } = render(
      <StrictMode>
        <Field first={cleanupRef} second={legacyRef} />
      </StrictMode>,
    )
    const field = screen.getByRole('textbox', { name: 'Draft' })
    expect(cleanupRef).toHaveBeenLastCalledWith(field)
    expect(legacyRef).toHaveBeenLastCalledWith(field)
    expect(onCleanup).toHaveBeenCalledOnce()
    unmount()
    expect(onCleanup).toHaveBeenCalledTimes(2)
    expect(cleanupRef).not.toHaveBeenCalledWith(null)
    expect(legacyRef).toHaveBeenLastCalledWith(null)
  })
})
