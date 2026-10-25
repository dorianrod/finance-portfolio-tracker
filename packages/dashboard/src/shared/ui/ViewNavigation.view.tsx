import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useId,
} from 'react'

import type { ControlProps } from './controlProps'
import { SegmentedControlItem } from './SegmentedControl.view'

const NavigationContext = createContext('')

export function ViewNavigation({ children }: { children: ReactNode }) {
  const id = useId()
  return <NavigationContext value={id}>{children}</NavigationContext>
}

function ViewNavigationItem({
  value,
  ...props
}: ControlProps<ComponentProps<typeof SegmentedControlItem>> & {
  value: string
}) {
  const id = useContext(NavigationContext)
  if (!id) throw new Error('ViewNavigation.Item requires ViewNavigation.')
  return (
    <SegmentedControlItem
      {...props}
      id={`${id}-${value}-trigger`}
      aria-current={props.active ? 'page' : undefined}
      aria-controls={`${id}-${value}-panel`}
    />
  )
}

function ViewNavigationPanel({
  value,
  ...props
}: ControlProps<HTMLAttributes<HTMLDivElement>> & { value: string }) {
  const id = useContext(NavigationContext)
  if (!id) throw new Error('ViewNavigation.Panel requires ViewNavigation.')
  return (
    <div
      {...props}
      id={`${id}-${value}-panel`}
      role="region"
      aria-labelledby={`${id}-${value}-trigger`}
    />
  )
}

ViewNavigation.Item = ViewNavigationItem
ViewNavigation.Panel = ViewNavigationPanel
