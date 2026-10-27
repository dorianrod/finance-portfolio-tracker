import * as Primitive from '@radix-ui/react-popover'
import { useAtomValue } from 'jotai'
import { ScopeProvider } from 'jotai-scope'
import { type ComponentProps } from 'react'

import { useComposedRefs } from '@/shared/ui/services/useComposedRefs'
import { useScopedInput } from '@/shared/ui/services/useScopedInput'
import { popoverInputAtom } from '@/shared/ui/stores/popoverInputAtom'
import { POPOVER_CONTENT_VARIANTS } from '@/shared/ui/surfaceAppearance/popoverContentVariants'

import type { ControlProps } from './controlProps'
import { usePopoverState } from './usePopoverState'

export function Popover({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: ControlProps<ComponentProps<typeof Primitive.Root>>) {
  const context = usePopoverState(open, defaultOpen, onOpenChange)
  const scope = useScopedInput(popoverInputAtom, context)
  return (
    <ScopeProvider scope={scope}>
      <Primitive.Root
        {...props}
        open={context.open}
        onOpenChange={context.setOpen}
      />
    </ScopeProvider>
  )
}

function PopoverTrigger({
  label,
  ref,
  ...props
}: ControlProps<ComponentProps<typeof Primitive.Trigger>> & {
  label?: string
}) {
  const context = useAtomValue(popoverInputAtom)
  const triggerRef = useComposedRefs(context?.registerTrigger, ref)
  return (
    <Primitive.Trigger
      {...props}
      className="inline-flex items-center gap-2 px-3 py-1.5"
      ref={triggerRef}
      aria-label={label}
    />
  )
}

function PopoverContent({
  label,
  variant = 'default',
  ...props
}: ControlProps<ComponentProps<typeof Primitive.Content>> & {
  label: string
  variant?: 'default' | 'menu'
}) {
  const context = useAtomValue(popoverInputAtom)
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
        className={`z-[10000] max-h-[var(--radix-popover-content-available-height)] overflow-auto rounded-lg border border-border-strong bg-surface-raised shadow-xl ${POPOVER_CONTENT_VARIANTS[variant]}`}
      />
    </Primitive.Portal>
  )
}

Popover.Trigger = PopoverTrigger
Popover.Content = PopoverContent
