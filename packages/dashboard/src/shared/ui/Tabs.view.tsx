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
  ...props
}: ControlProps<ComponentProps<typeof Primitive.List>> & { label: string }) {
  return <Primitive.List {...props} aria-label={label} loop />
}

function TabsTrigger(
  props: ControlProps<ComponentProps<typeof Primitive.Trigger>>,
) {
  return <Primitive.Trigger {...props} />
}

function TabsContent(
  props: ControlProps<ComponentProps<typeof Primitive.Content>>,
) {
  return <Primitive.Content {...props} />
}

Tabs.List = TabsList
Tabs.Trigger = TabsTrigger
Tabs.Content = TabsContent
