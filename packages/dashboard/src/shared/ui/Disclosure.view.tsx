import {
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useId,
  useMemo,
} from 'react'

import type { ControlProps } from './controlProps'
import { Button, type ButtonProps } from './Controls.view'

const DisclosureContext = createContext<{
  id: string
  expanded: boolean
} | null>(null)

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

function DisclosureContent(
  props: ControlProps<HTMLAttributes<HTMLDivElement>>,
) {
  const context = useContext(DisclosureContext)
  if (!context) throw new Error('Disclosure.Content requires Disclosure.')
  return <div {...props} id={context.id} hidden={!context.expanded} />
}

Disclosure.Trigger = DisclosureTrigger
Disclosure.Content = DisclosureContent
