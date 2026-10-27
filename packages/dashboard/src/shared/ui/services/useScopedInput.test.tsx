// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { atom, createStore, Provider, useAtomValue } from 'jotai'
import { ScopeProvider } from 'jotai-scope'
import { type ReactNode, StrictMode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { useScopedInput } from './useScopedInput'

const inputAtom = atom('default')
const inheritedAtom = atom('parent')
const otherInputAtom = atom('other')

afterEach(cleanup)

function InputScope({
  value,
  children,
}: {
  value: string
  children: ReactNode
}) {
  const scope = useScopedInput(inputAtom, value)
  return <ScopeProvider scope={scope}>{children}</ScopeProvider>
}

function NestedScope({ children }: { children: ReactNode }) {
  const scope = useScopedInput(otherInputAtom, 'nested')
  return <ScopeProvider scope={scope}>{children}</ScopeProvider>
}

function Value({ label }: { label: string }) {
  const value = useAtomValue(inputAtom)
  const inherited = useAtomValue(inheritedAtom)
  return <output aria-label={label}>{`${value}/${inherited}`}</output>
}

function Example({ value }: { value: string }) {
  return (
    <InputScope value={value}>
      <Value label="Current input" />
      <input aria-label="Draft" defaultValue="" />
    </InputScope>
  )
}

describe('scoped UI inputs', () => {
  it('isolates sibling inputs while inheriting parent and nested scopes', () => {
    const store = createStore()
    store.set(inheritedAtom, 'selected')
    render(
      <Provider store={store}>
        <InputScope value="first">
          <NestedScope>
            <Value label="First" />
          </NestedScope>
        </InputScope>
        <InputScope value="second">
          <Value label="Second" />
        </InputScope>
        <Value label="Outside" />
      </Provider>,
    )
    expect(screen.getByRole('status', { name: 'First' }).textContent).toBe(
      'first/selected',
    )
    expect(screen.getByRole('status', { name: 'Second' }).textContent).toBe(
      'second/selected',
    )
    expect(screen.getByRole('status', { name: 'Outside' }).textContent).toBe(
      'default/selected',
    )
    act(() => store.set(inheritedAtom, 'updated'))
    expect(screen.getByRole('status', { name: 'First' }).textContent).toBe(
      'first/updated',
    )
    expect(screen.getByRole('status', { name: 'Second' }).textContent).toBe(
      'second/updated',
    )
  })

  it('updates controlled inputs without remounting children or losing focus', async () => {
    const store = createStore()
    const user = userEvent.setup()
    const { rerender } = render(
      <StrictMode>
        <Provider store={store}>
          <Example value="first" />
        </Provider>
      </StrictMode>,
    )
    const field = screen.getByRole('textbox', { name: 'Draft' })
    await user.type(field, 'Keep this draft')
    rerender(
      <StrictMode>
        <Provider store={store}>
          <Example value="second" />
        </Provider>
      </StrictMode>,
    )
    expect(
      screen.getByRole('status', { name: 'Current input' }).textContent,
    ).toBe('second/parent')
    expect(screen.getByRole('textbox', { name: 'Draft' })).toBe(field)
    expect(field).toHaveProperty('value', 'Keep this draft')
    expect(document.activeElement).toBe(field)
  })
})
