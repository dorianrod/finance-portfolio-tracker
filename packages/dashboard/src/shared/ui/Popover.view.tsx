import * as Primitive from '@radix-ui/react-popover'
import { type ComponentProps, createContext, useContext } from 'react'

import type { ControlProps } from './controlProps'
import { type PopoverState, usePopoverState } from './usePopoverState'

const PopoverContext = createContext<PopoverState | null>(null)

export function Popover({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: ControlProps<ComponentProps<typeof Primitive.Root>>) {
  const context = usePopoverState(open, defaultOpen, onOpenChange)
  return (
    <PopoverContext value={context}>
      <Primitive.Root
        {...props}
        open={context.open}
        onOpenChange={context.setOpen}
      />
    </PopoverContext>
  )
}

function PopoverTrigger({
  label,
  ...props
}: ControlProps<ComponentProps<typeof Primitive.Trigger>> & {
  label?: string
}) {
  const context = useContext(PopoverContext)
  return (
    <Primitive.Trigger
      {...props}
      ref={context?.registerTrigger}
      aria-label={label}
    />
  )
}

function PopoverContent({
  label,
  className = '',
  ...props
}: ControlProps<ComponentProps<typeof Primitive.Content>> & { label: string }) {
  const context = useContext(PopoverContext)
  return (
    <Primitive.Portal>
      <Primitive.Content
        {...props}
        aria-label={label}
        sideOffset={6}
        collisionPadding={8}
        onCloseAutoFocus={context?.restoreAfterTab}
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'a[href], button, input, select, textarea, [tabindex]',
            ),
          ).filter(
            (element) =>
              element.tabIndex >= 0 &&
              !element.matches(':disabled') &&
              !element.closest('[hidden]'),
          )
          const boundary = event.shiftKey ? controls[0] : controls.at(-1)
          if (!boundary || document.activeElement === boundary) {
            event.preventDefault()
            context?.exitWithTab(event.currentTarget, event.shiftKey)
          }
        }}
        className={`z-[10000] max-h-[var(--radix-popover-content-available-height)] overflow-auto rounded-lg border border-border-strong bg-surface-raised p-3 shadow-xl ${className}`}
      />
    </Primitive.Portal>
  )
}

Popover.Trigger = PopoverTrigger
Popover.Content = PopoverContent
