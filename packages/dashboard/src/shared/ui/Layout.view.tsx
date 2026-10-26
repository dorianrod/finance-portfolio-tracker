import { type ComponentPropsWithRef, createElement } from 'react'

import {
  LAYOUT_AFTER,
  LAYOUT_ALIGNMENTS,
  LAYOUT_BEFORE,
  LAYOUT_COLUMNS,
  LAYOUT_FLOWS,
  LAYOUT_GAPS,
  LAYOUT_HEIGHTS,
  LAYOUT_HIDDEN_FROM,
  LAYOUT_INSETS,
  LAYOUT_JUSTIFICATION,
  LAYOUT_OVERFLOW,
  LAYOUT_PLACEMENTS,
  LAYOUT_PRESETS,
  LAYOUT_RESPONSIVENESS,
  LAYOUT_SIZING,
  LAYOUT_WIDTHS,
} from './layoutAppearance'

export function Layout<T extends LayoutTag = 'div'>({
  as,
  flow,
  gap,
  inset,
  spaceBefore,
  spaceAfter,
  align,
  justify,
  sizing,
  width,
  height,
  columns,
  arrangement,
  overflow,
  placement,
  hiddenUntil,
  hideFrom,
  ...props
}: LayoutProps<T>) {
  return createElement(as ?? 'div', {
    ...props,
    className:
      [
        flow &&
          (flow === 'row' && as === 'span'
            ? 'inline-flex'
            : LAYOUT_FLOWS[flow]),
        gap && LAYOUT_GAPS[gap],
        inset && LAYOUT_INSETS[inset],
        spaceBefore && LAYOUT_BEFORE[spaceBefore],
        spaceAfter && LAYOUT_AFTER[spaceAfter],
        align && LAYOUT_ALIGNMENTS[align],
        justify && LAYOUT_JUSTIFICATION[justify],
        sizing && LAYOUT_SIZING[sizing],
        width && LAYOUT_WIDTHS[width],
        height && LAYOUT_HEIGHTS[height],
        columns && LAYOUT_COLUMNS[columns],
        arrangement && LAYOUT_PRESETS[arrangement],
        overflow && LAYOUT_OVERFLOW[overflow],
        placement && LAYOUT_PLACEMENTS[placement],
        hiddenUntil && LAYOUT_RESPONSIVENESS[hiddenUntil],
        hideFrom && LAYOUT_HIDDEN_FROM[hideFrom],
        height === 'icon' && !width && 'w-4',
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  })
}

export function Stack<T extends LayoutTag = 'div'>(props: LayoutProps<T>) {
  return <Layout gap="relaxed" flow="column" {...props} />
}

export function Inline<T extends LayoutTag = 'span'>(props: LayoutProps<T>) {
  return <Layout as="span" gap="default" align="center" flow="row" {...props} />
}

export function Grid<T extends LayoutTag = 'div'>(props: LayoutProps<T>) {
  return (
    <Layout
      gap="relaxed"
      flow="grid"
      {...props}
      columns={props.arrangement ? undefined : (props.columns ?? 2)}
    />
  )
}

export function Inset<T extends LayoutTag = 'div'>(props: LayoutProps<T>) {
  return <Layout inset="default" {...props} />
}

type LayoutTag =
  | 'div'
  | 'span'
  | 'section'
  | 'header'
  | 'footer'
  | 'nav'
  | 'ol'
  | 'ul'
  | 'li'
  | 'dl'
  | 'dt'
  | 'dd'
  | 'col'
  | 'table'
  | 'thead'
  | 'tbody'
  | 'tr'
  | 'td'
  | 'th'
  | 'label'
  | 'p'
type LayoutProps<T extends LayoutTag> = Omit<
  ComponentPropsWithRef<T>,
  'className' | 'style' | 'align' | 'width' | 'height' | 'wrap'
> & {
  as?: T
  flow?: keyof typeof LAYOUT_FLOWS
  gap?: keyof typeof LAYOUT_GAPS
  inset?: keyof typeof LAYOUT_INSETS
  spaceBefore?: keyof typeof LAYOUT_BEFORE
  spaceAfter?: keyof typeof LAYOUT_AFTER
  align?: keyof typeof LAYOUT_ALIGNMENTS
  justify?: keyof typeof LAYOUT_JUSTIFICATION
  sizing?: keyof typeof LAYOUT_SIZING
  width?: keyof typeof LAYOUT_WIDTHS
  height?: keyof typeof LAYOUT_HEIGHTS
  columns?: keyof typeof LAYOUT_COLUMNS
  arrangement?: keyof typeof LAYOUT_PRESETS
  overflow?: keyof typeof LAYOUT_OVERFLOW
  placement?: keyof typeof LAYOUT_PLACEMENTS
  hiddenUntil?: keyof typeof LAYOUT_RESPONSIVENESS
  hideFrom?: keyof typeof LAYOUT_HIDDEN_FROM
}
