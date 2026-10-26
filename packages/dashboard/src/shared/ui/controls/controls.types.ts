import type { ButtonHTMLAttributes, HTMLAttributes } from 'react'

import { BUTTON_VARIANTS } from '@/shared/ui/buttonAppearance/buttonVariants'
import type { ControlProps } from '@/shared/ui/controlProps'
import { BUTTON_SIZES } from '@/shared/ui/layoutAppearance/buttonSizes'

export type ButtonProps = ControlProps<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  label?: string
  onIntent?: () => void
  ref?: React.Ref<HTMLButtonElement>
  variant?: keyof typeof BUTTON_VARIANTS
  selected?: boolean
  dimmed?: boolean
  size?: keyof typeof BUTTON_SIZES
}

export type ContentProps = ControlProps<HTMLAttributes<HTMLDivElement>>

export type InlineProps = ControlProps<HTMLAttributes<HTMLSpanElement>>
