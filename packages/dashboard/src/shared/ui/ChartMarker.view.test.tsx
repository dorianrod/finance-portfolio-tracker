import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { ChartTone } from '@/shared/theme/chartColors'

import { ChartMarker } from './ChartMarker.view'

describe('ChartMarker', () => {
  it.each<{
    tone: ChartTone
    outline: ChartTone
    size: 'standard' | 'large'
    fill: string
    stroke: string
    radius: number
  }>([
    {
      tone: 'series1',
      outline: 'series1Stroke',
      size: 'standard',
      fill: '#3b82f6',
      stroke: '#1d4ed8',
      radius: 5,
    },
    {
      tone: 'series7',
      outline: 'series7Stroke',
      size: 'standard',
      fill: '#f97316',
      stroke: '#c2410c',
      radius: 5,
    },
    {
      tone: 'series11',
      outline: 'series11Stroke',
      size: 'large',
      fill: '#a855f7',
      stroke: '#7c3aed',
      radius: 6,
    },
  ])(
    'renders $tone with its outline and $size size',
    ({ tone, outline, size, fill, stroke, radius }) => {
      const html = renderToStaticMarkup(
        <ChartMarker
          cx={20}
          cy={30}
          tone={tone}
          outline={outline}
          size={size}
        />,
      )
      expect(html).toContain(`fill="${fill}"`)
      expect(html).toContain(`stroke="${stroke}"`)
      expect(html).toContain(`r="${radius}"`)
      expect(html).toContain('cx="20" cy="30"')
      expect(html).not.toContain('tone=')
    },
  )
})
