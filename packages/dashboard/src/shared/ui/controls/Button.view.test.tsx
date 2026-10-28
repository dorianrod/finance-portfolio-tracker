// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Button } from './Button.view'
import { NavigationButton } from './NavigationButton.view'

afterEach(cleanup)

describe('cancelable preload intent', () => {
  it.each(['button', 'navigation'])(
    'honors canceled pointer intent in %s',
    async (kind) => {
      const user = userEvent.setup()
      const onIntent = vi.fn()
      const onMouseEnter = vi.fn((event: React.MouseEvent<HTMLButtonElement>) =>
        event.preventDefault(),
      )
      render(
        kind === 'navigation' ? (
          <NavigationButton
            active={false}
            onIntent={onIntent}
            onMouseEnter={onMouseEnter}
          >
            Analysis
          </NavigationButton>
        ) : (
          <Button onIntent={onIntent} onMouseEnter={onMouseEnter}>
            Analysis
          </Button>
        ),
      )
      await user.hover(screen.getByRole('button', { name: 'Analysis' }))
      expect(onMouseEnter).toHaveBeenCalledOnce()
      expect(onIntent).not.toHaveBeenCalled()
      await user.tab()
      expect(onIntent).toHaveBeenCalledOnce()
    },
  )
})
