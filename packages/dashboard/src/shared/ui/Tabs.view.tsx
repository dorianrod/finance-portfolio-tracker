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
  className,
  ...props
}: ControlProps<ComponentProps<typeof Primitive.List>> & {
  label: string
  variant?: 'sidebar'
}) {
  return (
    <Primitive.List
      {...props}
      className={[
        variant === 'sidebar' && 'md:border-r md:border-border',
        className,
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
  className,
  ...props
}: ControlProps<ComponentProps<typeof Primitive.Trigger>> & {
  variant?: 'quality'
  selected?: boolean
}) {
  return (
    <Primitive.Trigger
      {...props}
      className={[
        variant === 'quality' && 'rounded-md text-left transition-colors',
        variant === 'quality' &&
          (selected ? 'bg-accent-muted/50' : 'hover:bg-surface'),
        className,
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
