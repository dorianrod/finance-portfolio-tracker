// @vitest-environment jsdom
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  Button,
  DecorativeSvg,
  Group,
  Input,
  Progress,
  StatusMessage,
  ToggleButton,
} from './Controls.view'
import { Disclosure } from './Disclosure.view'
import { Popover } from './Popover.view'
import { Preview } from './Preview.view'
import { useDelayedDismiss } from './services/useDelayedDismiss'
import { SidePanel } from './SidePanel.view'
import { Tabs } from './Tabs.view'
import { ViewNavigation } from './ViewNavigation.view'

afterEach(cleanup)

function PreviewExample() {
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const { cancel, schedule } = useDelayedDismiss(() => setAnchor(null))
  return (
    <Preview
      open={anchor !== null}
      onKeepOpen={cancel}
      onOpenChange={(open) => {
        if (!open) setAnchor(null)
      }}
    >
      <Preview.Trigger
        label="Preview asset"
        onPreview={(button) => {
          cancel()
          setAnchor(button.getBoundingClientRect())
        }}
        onDismiss={schedule}
      >
        Asset
      </Preview.Trigger>
      {anchor && (
        <Preview.Content
          label="Asset details"
          anchor={anchor}
          onMouseEnter={cancel}
          onMouseLeave={schedule}
        >
          <button>Open asset</button>
        </Preview.Content>
      )}
    </Preview>
  )
}

describe('shared accessibility primitives', () => {
  it.each([
    { shift: false, start: 'Last option', destination: 'Next control' },
    { shift: true, start: 'First option', destination: 'Accounts' },
  ])(
    'closes a popover and moves to $destination at its Tab boundary',
    async ({ shift, start, destination }) => {
      const user = userEvent.setup()
      render(
        <>
          <Popover>
            <Popover.Trigger>Accounts</Popover.Trigger>
            <Popover.Content label="Choose accounts">
              <button>First option</button>
              <button>Last option</button>
            </Popover.Content>
          </Popover>
          <button>Next control</button>
        </>,
      )
      await user.click(screen.getByRole('button', { name: 'Accounts' }))
      await user.click(screen.getByRole('button', { name: start }))
      await user.tab({ shift })
      expect(screen.queryByRole('dialog')).toBeNull()
      await waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByRole('button', { name: destination }),
        ),
      )
    },
  )

  it('keeps pointer activation on the trigger and supports explicit keyboard entry without delayed dismissal', async () => {
    const user = userEvent.setup()
    render(<PreviewExample />)
    const trigger = screen.getByRole('button', { name: 'Preview asset' })
    await user.click(trigger)
    expect(document.activeElement).toBe(trigger)
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Open asset' }),
    )
    await new Promise((resolve) => setTimeout(resolve, 250))
    expect(screen.getByRole('dialog', { name: 'Asset details' })).toBeTruthy()
  })

  it('keeps focus on the outside action when a preview is dismissed by clicking elsewhere', async () => {
    const user = userEvent.setup()
    render(
      <>
        <PreviewExample />
        <button>Next action</button>
      </>,
    )
    await user.tab()
    await user.keyboard('{Enter}')
    await user.click(screen.getByRole('button', { name: 'Next action' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Next action' }),
    )
  })

  it('exposes names, pressed state, field labels, announcements and progress from semantic data', () => {
    render(
      <Group label="Portfolio">
        <ToggleButton label="Details" active>
          <DecorativeSvg>
            <path d="M0 0" />
          </DecorativeSvg>
        </ToggleButton>
        <Input label="Amount" />
        <StatusMessage>Loading</StatusMessage>
        <StatusMessage urgent>Unavailable</StatusMessage>
        <Progress label="Coverage" value={75} />
      </Group>,
    )
    expect(
      screen.getByRole('button', { name: 'Details', pressed: true }),
    ).toBeTruthy()
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByRole('textbox', { name: 'Amount' })).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('Loading')
    expect(screen.getByRole('alert').textContent).toBe('Unavailable')
    expect(
      screen
        .getByRole('progressbar', { name: 'Coverage' })
        .getAttribute('aria-valuenow'),
    ).toBe('75')
  })

  it('preloads on keyboard focus and pointer intent through one semantic callback', async () => {
    const user = userEvent.setup()
    const preload = vi.fn()
    render(<Button onIntent={preload}>Analysis</Button>)
    await user.tab()
    expect(preload).toHaveBeenCalledOnce()
    await user.hover(screen.getByRole('button', { name: 'Analysis' }))
    expect(preload).toHaveBeenCalledTimes(2)
  })

  it('generates isolated disclosure associations and preserves the controlled expanded state', () => {
    render(
      <>
        <Disclosure expanded>
          <Disclosure.Trigger>First</Disclosure.Trigger>
          <Disclosure.Content>First detail</Disclosure.Content>
        </Disclosure>
        <Disclosure expanded={false}>
          <Disclosure.Trigger>Second</Disclosure.Trigger>
          <Disclosure.Content>Second detail</Disclosure.Content>
        </Disclosure>
      </>,
    )
    const first = screen.getByRole('button', { name: 'First', expanded: true })
    const second = screen.getByRole('button', {
      name: 'Second',
      expanded: false,
    })
    expect(first.getAttribute('aria-controls')).toBe(
      screen.getByText('First detail').id,
    )
    expect(first.getAttribute('aria-controls')).not.toBe(
      second.getAttribute('aria-controls'),
    )
    expect(screen.getByText('Second detail').hidden).toBe(true)
  })

  it('generates tab and panel associations and exposes only the selected panel', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="one">
        <Tabs.List label="Analysis">
          <Tabs.Trigger value="one">One</Tabs.Trigger>
          <Tabs.Trigger value="two">Two</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="one">First analysis</Tabs.Content>
        <Tabs.Content value="two">Second analysis</Tabs.Content>
      </Tabs>,
    )
    const first = screen.getByRole('tab', { name: 'One' })
    expect(first.getAttribute('aria-controls')).toBe(
      screen.getByRole('tabpanel', { name: 'One' }).id,
    )
    await user.click(screen.getByRole('tab', { name: 'Two' }))
    expect(screen.queryByRole('tabpanel', { name: 'One' })).toBeNull()
    expect(screen.getByRole('tabpanel', { name: 'Two' }).textContent).toBe(
      'Second analysis',
    )
  })

  it('connects separately rendered view navigation and its named region', () => {
    render(
      <ViewNavigation>
        <ViewNavigation.Item value="positions" active>
          Positions
        </ViewNavigation.Item>
        <ViewNavigation.Panel value="positions">
          Portfolio positions
        </ViewNavigation.Panel>
      </ViewNavigation>,
    )
    const button = screen.getByRole('button', { name: 'Positions' })
    const panel = screen.getByRole('region', { name: 'Positions' })
    expect(button.getAttribute('aria-controls')).toBe(panel.id)
    expect(panel.getAttribute('aria-labelledby')).toBe(button.id)
  })

  it('opens an interactive popover, closes it with Escape and returns focus to its trigger', async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <Popover.Trigger>Accounts</Popover.Trigger>
        <Popover.Content label="Choose accounts">
          <button>Select all</button>
        </Popover.Content>
      </Popover>,
    )
    const trigger = screen.getByRole('button', { name: 'Accounts' })
    await user.click(trigger)
    const panel = screen.getByRole('dialog', { name: 'Choose accounts' })
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id)
    expect(document.activeElement).toBe(within(panel).getByRole('button'))
    await user.keyboard('{Escape}')
    await waitFor(() => expect(document.activeElement).toBe(trigger))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('keeps keyboard focus on a preview trigger until the user activates it', async () => {
    const user = userEvent.setup()
    render(<PreviewExample />)
    const trigger = screen.getByRole('button', { name: 'Preview asset' })
    await user.tab()
    const panel = screen.getByRole('dialog', { name: 'Asset details' })
    expect(document.activeElement).toBe(trigger)
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    await user.keyboard('{Enter}')
    expect(document.activeElement).toBe(
      within(panel).getByRole('button', { name: 'Open asset' }),
    )
    await user.keyboard('{Escape}')
    await waitFor(() => expect(document.activeElement).toBe(trigger))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('dismisses an interactive preview before its containing dialog', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <SidePanel open closeLabel="Close details" onClose={onClose}>
        <SidePanel.Title>Details</SidePanel.Title>
        <PreviewExample />
      </SidePanel>,
    )
    await user.click(screen.getByRole('button', { name: 'Preview asset' }))
    expect(screen.getByRole('dialog', { name: 'Asset details' })).toBeTruthy()
    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog', { name: 'Asset details' })).toBeNull()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })
})
