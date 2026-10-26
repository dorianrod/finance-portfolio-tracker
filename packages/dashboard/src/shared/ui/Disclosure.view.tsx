import {
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useId,
  useMemo,
} from 'react'

import { Button } from '@/shared/ui/controls/Button.view'
import type { ButtonProps } from '@/shared/ui/controls/controls.types'
import { SURFACE_VARIANTS } from '@/shared/ui/surfaceAppearance/surfaceVariants'

import type { ControlProps } from './controlProps'

export function Disclosure({
  expanded,
  children,
}: {
  expanded: boolean
  children: ReactNode
}) {
  const id = useId()
  const context = useMemo(() => ({ id, expanded }), [id, expanded])
  return <DisclosureContext value={context}>{children}</DisclosureContext>
}

const DisclosureContext = createContext<{
  id: string
  expanded: boolean
} | null>(null)

function DisclosureTrigger(props: ButtonProps) {
  const context = useContext(DisclosureContext)
  if (!context) throw new Error('Disclosure.Trigger requires Disclosure.')
  return (
    <Button
      {...props}
      aria-expanded={context.expanded}
      aria-controls={context.id}
    />
  )
}

function DisclosureContent({
  variant,
  ...props
}: ControlProps<HTMLAttributes<HTMLDivElement>> & {
  variant?: keyof typeof SURFACE_VARIANTS
}) {
  const context = useContext(DisclosureContext)
  if (!context) throw new Error('Disclosure.Content requires Disclosure.')
  return (
    <div
      {...props}
      className={[variant && SURFACE_VARIANTS[variant]]
        .filter(Boolean)
        .join(' ')}
      id={context.id}
      hidden={!context.expanded}
    />
  )
}

Disclosure.Trigger = DisclosureTrigger
Disclosure.Content = DisclosureContent
