import { describe, expect, it } from 'vitest'

import { getSourcesTooltipStyle } from './getSourcesTooltipStyle'

describe('getSourcesTooltipStyle', () => {
  it.each([
    {
      name: 'below the trigger when the sources fit',
      anchor: { left: 100, top: 100, bottom: 120 },
      sourceCount: 2,
      viewport: { width: 1000, height: 800 },
      expected: { left: 100, width: 340, top: 126 },
    },
    {
      name: 'above the trigger when the sources do not fit below',
      anchor: { left: 100, top: 700, bottom: 720 },
      sourceCount: 2,
      viewport: { width: 1000, height: 800 },
      expected: { left: 100, width: 340, bottom: 106 },
    },
    {
      name: 'above at the exact vertical boundary',
      anchor: { left: 100, top: 100, bottom: 120 },
      sourceCount: 2,
      viewport: { width: 1000, height: 216 },
      expected: { left: 100, width: 340, bottom: 122 },
    },
    {
      name: 'inside the right viewport edge',
      anchor: { left: 950, top: 100, bottom: 120 },
      sourceCount: 2,
      viewport: { width: 1000, height: 800 },
      expected: { left: 652, width: 340, top: 126 },
    },
    {
      name: 'inside the left viewport edge',
      anchor: { left: -20, top: 100, bottom: 120 },
      sourceCount: 2,
      viewport: { width: 1000, height: 800 },
      expected: { left: 8, width: 340, top: 126 },
    },
    {
      name: 'sized to a narrow viewport',
      anchor: { left: 100, top: 100, bottom: 120 },
      sourceCount: 2,
      viewport: { width: 300, height: 800 },
      expected: { left: 8, width: 284, top: 126 },
    },
    {
      name: 'above when a longer list would overflow',
      anchor: { left: 100, top: 100, bottom: 120 },
      sourceCount: 30,
      viewport: { width: 1000, height: 800 },
      expected: { left: 100, width: 340, bottom: 706 },
    },
  ])(
    'positions the tooltip $name',
    ({ anchor, sourceCount, viewport, expected }) => {
      expect(getSourcesTooltipStyle(anchor, sourceCount, viewport)).toEqual(
        expected,
      )
    },
  )
})
