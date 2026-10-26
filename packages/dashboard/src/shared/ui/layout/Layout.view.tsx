import { createElement } from 'react'

import { LAYOUT_AFTER } from '@/shared/ui/layoutAppearance/layoutAfter'
import { LAYOUT_ALIGNMENTS } from '@/shared/ui/layoutAppearance/layoutAlignments'
import { LAYOUT_BEFORE } from '@/shared/ui/layoutAppearance/layoutBefore'
import { LAYOUT_COLUMNS } from '@/shared/ui/layoutAppearance/layoutColumns'
import { LAYOUT_FLOWS } from '@/shared/ui/layoutAppearance/layoutFlows'
import { LAYOUT_GAPS } from '@/shared/ui/layoutAppearance/layoutGaps'
import { LAYOUT_HEIGHTS } from '@/shared/ui/layoutAppearance/layoutHeights'
import { LAYOUT_HIDDEN_FROM } from '@/shared/ui/layoutAppearance/layoutHiddenFrom'
import { LAYOUT_INSETS } from '@/shared/ui/layoutAppearance/layoutInsets'
import { LAYOUT_JUSTIFICATION } from '@/shared/ui/layoutAppearance/layoutJustification'
import { LAYOUT_OVERFLOW } from '@/shared/ui/layoutAppearance/layoutOverflow'
import { LAYOUT_PLACEMENTS } from '@/shared/ui/layoutAppearance/layoutPlacements'
import { LAYOUT_PRESETS } from '@/shared/ui/layoutAppearance/layoutPresets'
import { LAYOUT_RESPONSIVENESS } from '@/shared/ui/layoutAppearance/layoutResponsiveness'
import { LAYOUT_SIZING } from '@/shared/ui/layoutAppearance/layoutSizing'
import { LAYOUT_WIDTHS } from '@/shared/ui/layoutAppearance/layoutWidths'

import type { LayoutProps, LayoutTag } from './layout.types'

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
