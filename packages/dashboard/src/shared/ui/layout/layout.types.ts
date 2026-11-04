import type { ComponentPropsWithRef } from 'react'

import type { ControlProps } from '@/shared/ui/controlProps'
import type { LAYOUT_AFTER } from '@/shared/ui/layoutAppearance/layoutAfter'
import type { LAYOUT_ALIGNMENTS } from '@/shared/ui/layoutAppearance/layoutAlignments'
import type { LAYOUT_BEFORE } from '@/shared/ui/layoutAppearance/layoutBefore'
import type { LAYOUT_COLUMNS } from '@/shared/ui/layoutAppearance/layoutColumns'
import type { LAYOUT_FLOWS } from '@/shared/ui/layoutAppearance/layoutFlows'
import type { LAYOUT_GAPS } from '@/shared/ui/layoutAppearance/layoutGaps'
import type { LAYOUT_HEIGHTS } from '@/shared/ui/layoutAppearance/layoutHeights'
import type { LAYOUT_HIDDEN_FROM } from '@/shared/ui/layoutAppearance/layoutHiddenFrom'
import type { LAYOUT_INSETS } from '@/shared/ui/layoutAppearance/layoutInsets'
import type { LAYOUT_JUSTIFICATION } from '@/shared/ui/layoutAppearance/layoutJustification'
import type { LAYOUT_OVERFLOW } from '@/shared/ui/layoutAppearance/layoutOverflow'
import type { LAYOUT_PLACEMENTS } from '@/shared/ui/layoutAppearance/layoutPlacements'
import type { LAYOUT_PRESETS } from '@/shared/ui/layoutAppearance/layoutPresets'
import type { LAYOUT_RESPONSIVENESS } from '@/shared/ui/layoutAppearance/layoutResponsiveness'
import type { LAYOUT_SIZING } from '@/shared/ui/layoutAppearance/layoutSizing'
import type { LAYOUT_WIDTHS } from '@/shared/ui/layoutAppearance/layoutWidths'

export type LayoutTag =
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

export type LayoutProps<T extends LayoutTag> = Omit<
  ControlProps<ComponentPropsWithRef<T>>,
  'align' | 'width' | 'height' | 'wrap'
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
