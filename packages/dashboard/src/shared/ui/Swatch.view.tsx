import { createElement, type HTMLAttributes } from 'react'

import { CHART_COLORS } from '@/shared/theme/chartColors'

import { SWATCH_SIZES } from './layoutAppearance'
import { layoutShare } from './layoutGeometry'
import { SWATCH_SHAPES, SWATCH_TONES } from './swatchAppearance'

export function SeriesSwatch({
  tone,
  selected = false,
  style,
  ...props
}: SwatchProps & { tone: keyof typeof CHART_COLORS; selected?: boolean }) {
  return (
    <SwatchFrame
      {...props}
      style={{
        ...style,
        backgroundColor: CHART_COLORS[tone],
        ...(selected && {
          outline: '2px solid var(--ds-content)',
          outlineOffset: 1,
        }),
      }}
    />
  )
}

export function ToneSwatch({
  tone,
  ...props
}: SwatchProps & { tone: keyof typeof SWATCH_TONES }) {
  return <SwatchFrame {...props} tone={tone} />
}

type SwatchProps = Omit<HTMLAttributes<HTMLSpanElement>, 'className'> & {
  as?: 'span' | 'div' | 'i'
  shape?: keyof typeof SWATCH_SHAPES
  prominence?: 'strong'
  share?: number
  size?: 'compact' | 'default' | 'large'
}

function SwatchFrame({
  as = 'span',
  shape = 'line',
  prominence,
  share,
  size,
  style,
  tone,
  ...props
}: SwatchProps & { tone?: keyof typeof SWATCH_TONES }) {
  return createElement(as, {
    ...props,
    'aria-hidden': true,
    style: {
      ...style,
      ...(share !== undefined && { width: `${layoutShare(share)}%` }),
    },
    className:
      [
        size ? SWATCH_SIZES[size] : 'block h-full w-full',
        SWATCH_SHAPES[shape],
        tone && SWATCH_TONES[tone],
        prominence === 'strong' && 'opacity-80',
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  })
}
