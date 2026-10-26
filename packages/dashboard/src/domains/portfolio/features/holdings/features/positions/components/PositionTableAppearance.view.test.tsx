import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  PositionRowSurface,
  TransactionBadge,
} from './PositionTableAppearance.view'

describe('position table appearance', () => {
  it.each([
    {
      kind: 'position' as const,
      closed: false,
      background: 'bg-surface',
      dimmed: false,
    },
    {
      kind: 'group' as const,
      closed: false,
      background: 'bg-surface-raised',
      dimmed: false,
    },
    {
      kind: 'detail' as const,
      closed: false,
      background: 'bg-canvas',
      dimmed: false,
    },
    {
      kind: 'position' as const,
      closed: true,
      background: 'bg-canvas',
      dimmed: true,
    },
  ])(
    'maps $kind closed=$closed to the existing row presentation',
    ({ kind, closed, background, dimmed }) => {
      const html = renderToStaticMarkup(
        <table>
          <tbody>
            <PositionRowSurface kind={kind} closed={closed}>
              <td>Row</td>
            </PositionRowSurface>
          </tbody>
        </table>,
      )
      expect(html).toContain(background)
      expect(html.includes('opacity-40')).toBe(dimmed)
      expect(html).not.toContain('closed=')
      expect(html).not.toContain('kind=')
    },
  )

  it.each([
    { kind: 'buy' as const, tone: 'text-accent' },
    { kind: 'sell' as const, tone: 'text-attention' },
    { kind: 'other' as const, tone: 'text-decorative' },
  ])('maps $kind to its UI tone', ({ kind, tone }) => {
    const html = renderToStaticMarkup(
      <TransactionBadge kind={kind}>Operation</TransactionBadge>,
    )
    expect(html).toContain(tone)
    expect(html).toContain('Operation</span>')
    expect(html).not.toContain('kind=')
  })
})
