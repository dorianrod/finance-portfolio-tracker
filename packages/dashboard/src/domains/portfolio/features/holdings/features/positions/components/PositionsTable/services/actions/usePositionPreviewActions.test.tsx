// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider, useAtomValue } from 'jotai'
import { ScopeProvider } from 'jotai-scope'
import { afterEach, describe, expect, it } from 'vitest'

import { makePositionPreviewSelection } from '@/domains/portfolio/features/holdings/features/positions/mocks/positionPreviewSelection.mock'
import { positionPreviewAtom } from '@/domains/portfolio/features/holdings/features/positions/stores/positionPreviews/positionPreviewAtom'

import { usePositionPreviewActions } from './usePositionPreviewActions'

afterEach(cleanup)

const PREVIEW_ATOMS = [positionPreviewAtom]

function Controls({ name }: { name: string }) {
  const { showPreview, dismiss } = usePositionPreviewActions()
  const selection = useAtomValue(positionPreviewAtom)
  return (
    <>
      <button onClick={() => showPreview(makePositionPreviewSelection())}>
        {name} chart
      </button>
      <button
        onClick={() =>
          showPreview(makePositionPreviewSelection({ kind: 'allocation' }))
        }
      >
        {name} allocation
      </button>
      <button onClick={dismiss}>{name} close</button>
      <output aria-label={name}>{selection?.kind ?? 'closed'}</output>
    </>
  )
}

describe('position preview actions', () => {
  it('replaces the active preview without leaking into another table or its parent store', async () => {
    const user = userEvent.setup()
    render(
      <Provider store={createStore()}>
        <ScopeProvider atoms={PREVIEW_ATOMS}>
          <Controls name="First" />
        </ScopeProvider>
        <ScopeProvider atoms={PREVIEW_ATOMS}>
          <Controls name="Second" />
        </ScopeProvider>
        <Controls name="Outside" />
      </Provider>,
    )
    await user.click(screen.getByRole('button', { name: 'First chart' }))
    expect(screen.getByRole('status', { name: 'First' }).textContent).toBe(
      'chart',
    )
    expect(screen.getByRole('status', { name: 'Second' }).textContent).toBe(
      'closed',
    )
    expect(screen.getByRole('status', { name: 'Outside' }).textContent).toBe(
      'closed',
    )
    await user.click(screen.getByRole('button', { name: 'First allocation' }))
    expect(screen.getByRole('status', { name: 'First' }).textContent).toBe(
      'allocation',
    )
    await user.click(screen.getByRole('button', { name: 'First close' }))
    await user.click(screen.getByRole('button', { name: 'First close' }))
    expect(screen.getByRole('status', { name: 'First' }).textContent).toBe(
      'closed',
    )
  })
})
