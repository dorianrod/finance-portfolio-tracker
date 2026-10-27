import * as Primitive from '@radix-ui/react-tooltip'
import { useAtomValue } from 'jotai'
import { ScopeProvider } from 'jotai-scope'
import { type ComponentProps, useMemo, useState } from 'react'

import { useScopedInput } from '@/shared/ui/services/useScopedInput'
import { tooltipInputAtom } from '@/shared/ui/stores/tooltipInputAtom'

import type { ControlProps } from './controlProps'

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const input = useMemo(() => ({ setOpen }), [setOpen])
  const scope = useScopedInput(tooltipInputAtom, input)
  return (
    <Primitive.Provider delayDuration={0}>
      <ScopeProvider scope={scope}>
        <Primitive.Root open={open} onOpenChange={setOpen}>
          {children}
        </Primitive.Root>
      </ScopeProvider>
    </Primitive.Provider>
  )
}

function TooltipTrigger({
  label,
  variant,
  ...props
}: ControlProps<ComponentProps<typeof Primitive.Trigger>> & {
  label?: string
  variant?: 'info' | 'help' | 'source' | 'columnHelp'
}) {
  const context = useAtomValue(tooltipInputAtom)
  return (
    <Primitive.Trigger
      {...props}
      type="button"
      className={[
        variant === 'columnHelp' &&
          'grid size-5 cursor-help place-items-center rounded-full text-[10px] leading-none text-content-subtle transition-colors hover:bg-surface-raised hover:text-content-secondary',
        variant === 'help' &&
          'inline-flex size-6 items-center justify-center ui-help-trigger rounded-r-md text-content-subtle transition-colors hover:text-content-muted focus-visible:text-content-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/70',
        variant === 'source' &&
          'cursor-help truncate text-left underline decoration-dotted decoration-border-strong underline-offset-4',
        variant === 'info' &&
          'flex size-5 items-center justify-center rounded-full border border-border-strong bg-surface-raised text-[10px] font-bold leading-none text-content-muted transition-colors hover:bg-surface-hover hover:text-content-secondary',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={label}
      onClick={(event) => {
        event.preventDefault()
        context?.setOpen(true)
      }}
      onMouseLeave={(event) => {
        if (document.activeElement === event.currentTarget)
          event.preventDefault()
      }}
    />
  )
}

function TooltipContent({
  variant,
  ...props
}: ControlProps<ComponentProps<typeof Primitive.Content>> & {
  variant?: 'info' | 'left'
}) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        {...props}
        sideOffset={6}
        collisionPadding={8}
        className={`z-[10000] max-w-[calc(100vw-1rem)] rounded-control border border-border-strong bg-surface-raised p-3 text-xs text-content-secondary shadow-xl ${variant === 'left' ? 'text-left' : ''} ${variant === 'info' ? 'text-left font-normal normal-case leading-relaxed tracking-normal' : ''} `}
        onEscapeKeyDown={(event) => event.stopPropagation()}
      />
    </Primitive.Portal>
  )
}

Tooltip.Trigger = TooltipTrigger
Tooltip.Content = TooltipContent
