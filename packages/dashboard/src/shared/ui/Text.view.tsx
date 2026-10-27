import { type ComponentPropsWithoutRef, createElement } from 'react'

import {
  getTextClassName,
  type TextAppearance,
} from '@/shared/ui/textAppearance/getTextClassName'

export function Text<T extends TextTag = 'span'>({
  as,
  variant = 'inherit',
  tone,
  align,
  wrap,
  numeric = false,
  truncate = false,
  ...props
}: TextProps<T>) {
  return createElement(as ?? 'span', {
    ...props,
    className: getTextClassName({
      as,
      variant,
      tone,
      align,
      wrap,
      numeric,
      truncate,
    }),
  })
}

export type TextTag =
  | 'span'
  | 'p'
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'strong'
  | 'small'
  | 'code'
  | 'pre'
  | 'label'
  | 'td'
  | 'th'
  | 'dt'
  | 'dd'
  | 'li'

export type TextProps<T extends TextTag> = Omit<
  ComponentPropsWithoutRef<T>,
  'className' | 'style'
> &
  TextAppearance & {
    as?: T
  }
