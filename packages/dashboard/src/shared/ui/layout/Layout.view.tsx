import { createElement } from 'react'

import { getLayoutTokenClass } from '@/shared/ui/layoutAppearance/getLayoutTokenClass'
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
        getLayoutTokenClass(LAYOUT_GAPS, gap),
        getLayoutTokenClass(LAYOUT_INSETS, inset),
        getLayoutTokenClass(LAYOUT_BEFORE, spaceBefore),
        getLayoutTokenClass(LAYOUT_AFTER, spaceAfter),
        getLayoutTokenClass(LAYOUT_ALIGNMENTS, align),
        getLayoutTokenClass(LAYOUT_JUSTIFICATION, justify),
        getLayoutTokenClass(LAYOUT_SIZING, sizing),
        getLayoutTokenClass(LAYOUT_WIDTHS, width),
        getLayoutTokenClass(LAYOUT_HEIGHTS, height),
        getLayoutTokenClass(LAYOUT_COLUMNS, columns),
        getLayoutTokenClass(LAYOUT_PRESETS, arrangement),
        getLayoutTokenClass(LAYOUT_OVERFLOW, overflow),
        getLayoutTokenClass(LAYOUT_PLACEMENTS, placement),
        getLayoutTokenClass(LAYOUT_RESPONSIVENESS, hiddenUntil),
        getLayoutTokenClass(LAYOUT_HIDDEN_FROM, hideFrom),
        height === 'icon' && !width && 'w-4',
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  })
}
