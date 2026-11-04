// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createStore, Provider } from 'jotai'
import { type ReactNode, useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Preview } from './Preview.view'

afterEach(cleanup)

function PreviewExample({ children }: { children: ReactNode }) {
  const [store] = useState(createStore)
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState(() => new DOMRect())
  return (
    <Provider store={store}>
      <Preview open={open} onOpenChange={setOpen}>
        <Preview.Trigger
          onPreview={(button) => {
            setAnchor(button.getBoundingClientRect())
            setOpen(true)
          }}
          onDismiss={() => {}}
        >
          Preview asset
        </Preview.Trigger>
        <Preview.Content label="Asset details" anchor={anchor}>
          {children}
        </Preview.Content>
      </Preview>
      <button>Next action</button>
    </Provider>
  )
}

describe('preview activation and focus', () => {
  it('keeps the next preview open when its content component is replaced', async () => {
    const store = createStore()
    const onOpenChange = vi.fn()
    const anchor = new DOMRect()
    const { rerender } = render(
      <Provider store={store}>
        <Preview open onOpenChange={onOpenChange}>
          <div>
            <Preview.Content key="first" label="First asset" anchor={anchor}>
              First details
            </Preview.Content>
          </div>
        </Preview>
      </Provider>,
    )
    expect(screen.getByRole('dialog', { name: 'First asset' })).toBeTruthy()
    rerender(
      <Provider store={store}>
        <Preview open onOpenChange={onOpenChange}>
          <div>
            <Preview.Content key="next" label="Next asset" anchor={anchor}>
              Next details
            </Preview.Content>
          </div>
        </Preview>
      </Provider>,
    )
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: 'Next asset' })).toBeTruthy(),
    )
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it.each([false, true])(
    'exits the preview with Tab, shift=%s',
    async (shift) => {
      const user = userEvent.setup()
      render(
        <PreviewExample>
          <button>Open asset</button>
        </PreviewExample>,
      )
      await user.tab()
      await user.keyboard('{Enter}')
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Open asset' }),
      )
      await user.tab({ shift })
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(document.activeElement).toBe(
        screen.getByRole('button', {
          name: shift ? 'Preview asset' : 'Next action',
        }),
      )
    },
  )

  it('runs the inherited preload intent on pointer entry and keyboard focus', async () => {
    const user = userEvent.setup()
    const onIntent = vi.fn()
    render(
      <Provider store={createStore()}>
        <Preview open={false} onOpenChange={vi.fn()}>
          <Preview.Trigger
            onPreview={vi.fn()}
            onDismiss={vi.fn()}
            onIntent={onIntent}
          >
            Preview asset
          </Preview.Trigger>
        </Preview>
      </Provider>,
    )
    await user.hover(screen.getByRole('button', { name: 'Preview asset' }))
    expect(onIntent).toHaveBeenCalledOnce()
    await user.tab()
    expect(onIntent).toHaveBeenCalledTimes(2)
  })

  it('lets the caller cancel pointer activation', async () => {
    const user = userEvent.setup()
    const onPreview = vi.fn()
    render(
      <Provider store={createStore()}>
        <Preview open={false} onOpenChange={vi.fn()}>
          <Preview.Trigger
            onPreview={onPreview}
            onDismiss={vi.fn()}
            onMouseEnter={(event) => event.preventDefault()}
          >
            Preview asset
          </Preview.Trigger>
        </Preview>
      </Provider>,
    )
    await user.hover(screen.getByRole('button', { name: 'Preview asset' }))
    expect(onPreview).not.toHaveBeenCalled()
  })

  it('lets the caller cancel keyboard activation after focus', async () => {
    const user = userEvent.setup()
    const onPreview = vi.fn()
    const onClick = vi.fn((event: React.MouseEvent<HTMLButtonElement>) =>
      event.preventDefault(),
    )
    render(
      <Provider store={createStore()}>
        <Preview open={false} onOpenChange={vi.fn()}>
          <Preview.Trigger
            onPreview={onPreview}
            onDismiss={vi.fn()}
            onClick={onClick}
          >
            Preview asset
          </Preview.Trigger>
        </Preview>
      </Provider>,
    )
    await user.tab()
    expect(onPreview).toHaveBeenCalledOnce()
    onPreview.mockClear()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledOnce()
    expect(onPreview).not.toHaveBeenCalled()
  })

  it.each([
    {
      name: 'disabled input',
      content: <input disabled aria-label="Disabled" />,
    },
    {
      name: 'disabled fieldset',
      content: (
        <fieldset disabled>
          <button>Disabled option</button>
        </fieldset>
      ),
    },
    {
      name: 'hidden ancestor',
      content: (
        <div hidden>
          <button>Hidden option</button>
        </div>
      ),
    },
    {
      name: 'invisible ancestor',
      content: (
        <div style={{ display: 'none' }}>
          <button>Hidden option</button>
        </div>
      ),
    },
    {
      name: 'negative tab index',
      content: <button tabIndex={-1}>Programmatic option</button>,
    },
    {
      name: 'inert ancestor',
      content: (
        <div inert>
          <button>Inert option</button>
        </div>
      ),
    },
  ])('skips a $name when entering with the keyboard', async ({ content }) => {
    const user = userEvent.setup()
    render(
      <PreviewExample>
        {content}
        <button>Open asset</button>
      </PreviewExample>,
    )
    await user.tab()
    await user.keyboard('{Enter}')
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Open asset' }),
      ),
    )
  })

  it('focuses the dialog when it has no available control', async () => {
    const user = userEvent.setup()
    render(
      <PreviewExample>
        <input disabled aria-label="Disabled" />
      </PreviewExample>,
    )
    await user.tab()
    await user.keyboard('{Enter}')
    expect(document.activeElement).toBe(
      screen.getByRole('dialog', { name: 'Asset details' }),
    )
  })

  it('restores focus after reopening a preview previously dismissed outside', async () => {
    const user = userEvent.setup()
    render(
      <PreviewExample>
        <button>Open asset</button>
      </PreviewExample>,
    )
    const trigger = screen.getByRole('button', { name: 'Preview asset' })
    await user.tab()
    await user.keyboard('{Enter}')
    await user.click(screen.getByRole('button', { name: 'Next action' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await user.tab({ shift: true })
    await user.keyboard('{Enter}')
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Open asset' }),
    )
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })
})
