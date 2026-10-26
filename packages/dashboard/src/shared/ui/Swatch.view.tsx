import { createElement, type HTMLAttributes } from 'react'

import { catColor } from '@/shared/theme/chartColors'
import { SEMANTIC_COLORS } from '@/shared/theme/semanticColors'

import { SWATCH_SHAPES, SWATCH_TONES } from './swatchAppearance'

type SwatchProps = HTMLAttributes<HTMLSpanElement> & {
  as?: 'span' | 'div' | 'i'
  shape?: keyof typeof SWATCH_SHAPES
  prominence?: 'strong'
}

function SwatchFrame({
  as = 'span',
  shape = 'line',
  prominence,
  className,
  ...props
}: SwatchProps) {
  return createElement(as, {
    ...props,
    'aria-hidden': true,
    className:
      [SWATCH_SHAPES[shape], prominence === 'strong' && 'opacity-80', className]
        .filter(Boolean)
        .join(' ') || undefined,
  })
}

export function SeriesSwatch({
  tone,
  style,
  ...props
}: SwatchProps & { tone: keyof typeof SEMANTIC_COLORS }) {
  return (
    <SwatchFrame
      {...props}
      style={{ ...style, backgroundColor: SEMANTIC_COLORS[tone] }}
    />
  )
}

export function CategorySwatch({
  category,
  selected = false,
  style,
  ...props
}: SwatchProps & { category: string; selected?: boolean }) {
  return (
    <SwatchFrame
      {...props}
      style={{
        ...style,
        backgroundColor: catColor(category),
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
  className,
  ...props
}: SwatchProps & { tone: keyof typeof SWATCH_TONES }) {
  return (
    <SwatchFrame
      {...props}
      className={[SWATCH_TONES[tone], className].filter(Boolean).join(' ')}
    />
  )
}
