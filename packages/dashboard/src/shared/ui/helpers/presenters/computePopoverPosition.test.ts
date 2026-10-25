import { describe, expect, it } from 'vitest'

import { computePopoverPosition } from './computePopoverPosition'

describe('computePopoverPosition', () => {
  it('opens to the right of the anchor and keeps the top margin', () => {
    expect(
      computePopoverPosition(
        { left: 100, right: 150, top: 200, height: 20 },
        600,
        460,
        { width: 1200, height: 800 },
      ),
    ).toEqual({ top: 10, left: 160, width: 600, maxHeight: 780 })
  })

  it('opens to the left when there is no space on the right', () => {
    expect(
      computePopoverPosition(
        { left: 1000, right: 1050, top: 200, height: 20 },
        600,
        460,
        { width: 1200, height: 800 },
      ).left,
    ).toBe(390)
  })

  it('keeps the bottom margin when the anchor is near the viewport edge', () => {
    expect(
      computePopoverPosition(
        { left: 100, right: 150, top: 780, height: 20 },
        100,
        200,
        { width: 1200, height: 800 },
      ).top,
    ).toBe(590)
  })

  it.each([
    { width: 375, height: 320 },
    { width: 320, height: 240 },
  ])(
    'keeps an oversized popover inside a $width by $height viewport',
    (viewport) => {
      const position = computePopoverPosition(
        { left: 250, right: 300, top: 280, height: 20 },
        600,
        460,
        viewport,
      )
      expect(position.top).toBe(10)
      expect(position.left).toBe(10)
      expect(position.left + position.width).toBe(viewport.width - 10)
      expect(position.top + position.maxHeight).toBe(viewport.height - 10)
    },
  )
})
