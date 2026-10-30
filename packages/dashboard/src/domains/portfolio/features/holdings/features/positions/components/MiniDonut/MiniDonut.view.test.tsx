import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { makePieEntry } from '@/domains/portfolio/shared/mocks/pieEntry.mock'

import { MiniDonutView } from './MiniDonut.view'

describe('MiniDonutView', () => {
  it('renders supplied labels and proportional legend values', () => {
    const html = renderToStaticMarkup(
      <MiniDonutView
        title="Allocation"
        data={[makePieEntry(), makePieEntry({ name: 'Europe', value: 40 })]}
        total={100}
      />,
    )
    expect(html).toContain('Allocation')
    expect(html).toContain('France')
    expect(html).toContain('60%')
    expect(html).toContain('40%')
  })
  it('renders a zero-total legend without exposing an invalid percentage', () => {
    const html = renderToStaticMarkup(
      <MiniDonutView
        title="Empty allocation"
        data={[makePieEntry({ value: 0 })]}
        total={0}
      />,
    )
    expect(html).toContain('0%')
    expect(html).not.toContain('NaN')
  })
})
