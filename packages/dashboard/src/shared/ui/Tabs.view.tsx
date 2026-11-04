import * as Primitive from '@radix-ui/react-tabs'
import type { ComponentProps } from 'react'

import type { ControlProps } from './controlProps'

export function Tabs(
  props: ControlProps<ComponentProps<typeof Primitive.Root>>,
) {
  return <Primitive.Root {...props} />
}

function TabsList({
  label,
  variant,
  ...props
}: ControlProps<ComponentProps<typeof Primitive.List>> & {
  label: string
  variant?: 'sidebar'
}) {
  return (
    <Primitive.List
      {...props}
      className={[
        variant === 'sidebar' && 'hidden md:block md:border-r md:border-border',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={label}
      loop
    />
  )
}

function TabsTrigger({
  variant,
  selected,
  ...props
}: ControlProps<ComponentProps<typeof Primitive.Trigger>> & {
  variant?: 'stacked'
  selected?: boolean
}) {
  return (
    <Primitive.Trigger
      {...props}
      className={[
        variant === 'stacked' &&
          'flex w-full items-center gap-3 px-3 py-3 rounded-md text-left transition-colors',
        variant === 'stacked' &&
          (selected ? 'bg-accent-muted/50' : 'hover:bg-surface'),
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

function TabsContent(
  props: ControlProps<ComponentProps<typeof Primitive.Content>>,
) {
  return <Primitive.Content {...props} />
}

Tabs.List = TabsList
Tabs.Trigger = TabsTrigger
Tabs.Content = TabsContent
