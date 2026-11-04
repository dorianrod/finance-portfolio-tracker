import type { ComponentPropsWithoutRef } from 'react'

import type { ControlProps } from '@/shared/ui/controlProps'
import { CHOICE_ROW_VARIANTS } from '@/shared/ui/fieldAppearance/choiceRowVariants'

export function ChoiceRow({
  variant = 'default',
  ...props
}: ControlProps<ComponentPropsWithoutRef<'label'>> & {
  variant?: keyof typeof CHOICE_ROW_VARIANTS
}) {
  return (
    <label
      {...props}
      className={[CHOICE_ROW_VARIANTS[variant]].filter(Boolean).join(' ')}
    />
  )
}
