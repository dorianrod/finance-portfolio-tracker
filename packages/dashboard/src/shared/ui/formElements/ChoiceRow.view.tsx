import type { ComponentPropsWithoutRef } from 'react'

import { CHOICE_ROW_VARIANTS } from '@/shared/ui/fieldAppearance/choiceRowVariants'

export function ChoiceRow({
  variant = 'default',
  ...props
}: Omit<ComponentPropsWithoutRef<'label'>, 'className' | 'style'> & {
  variant?: keyof typeof CHOICE_ROW_VARIANTS
}) {
  return (
    <label
      {...props}
      className={[CHOICE_ROW_VARIANTS[variant]].filter(Boolean).join(' ')}
    />
  )
}
