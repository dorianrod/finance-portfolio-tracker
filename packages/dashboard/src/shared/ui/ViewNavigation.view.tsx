import { useAtomValue } from 'jotai'
import { ScopeProvider } from 'jotai-scope'
import {
  type ComponentProps,
  type HTMLAttributes,
  type ReactNode,
  useId,
} from 'react'

import { SegmentedControlItem } from '@/shared/ui/segmentedControl/SegmentedControlItem.view'
import { useScopedInput } from '@/shared/ui/services/useScopedInput'
import { navigationIdAtom } from '@/shared/ui/stores/navigationId.atoms'

import type { ControlProps } from './controlProps'

export function ViewNavigation({ children }: { children: ReactNode }) {
  const id = useId()
  const scope = useScopedInput(navigationIdAtom, id)
  return <ScopeProvider scope={scope}>{children}</ScopeProvider>
}

function ViewNavigationItem({
  value,
  ...props
}: ControlProps<ComponentProps<typeof SegmentedControlItem>> & {
  value: string
}) {
  const id = useAtomValue(navigationIdAtom)
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
  const id = useAtomValue(navigationIdAtom)
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
