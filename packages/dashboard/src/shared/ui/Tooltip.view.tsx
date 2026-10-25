import * as Primitive from '@radix-ui/react-tooltip'
import {
  type ComponentProps,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react'

import type { ControlProps } from './controlProps'

const TooltipContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const context = useMemo(() => ({ open, setOpen }), [open])
  return (
    <Primitive.Provider delayDuration={0}>
      <TooltipContext value={context}>
        <Primitive.Root open={open} onOpenChange={setOpen}>
          {children}
        </Primitive.Root>
      </TooltipContext>
    </Primitive.Provider>
  )
}

function TooltipTrigger({
  label,
  ...props
}: ControlProps<ComponentProps<typeof Primitive.Trigger>> & {
  label?: string
}) {
  const context = useContext(TooltipContext)
  return (
    <Primitive.Trigger
      {...props}
      type="button"
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
  className = '',
  ...props
}: ControlProps<ComponentProps<typeof Primitive.Content>>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        {...props}
        sideOffset={6}
        collisionPadding={8}
        className={`z-[10000] max-w-[calc(100vw-1rem)] rounded-control border border-border-strong bg-surface-raised p-3 text-xs text-content-secondary shadow-xl ${className}`}
        onEscapeKeyDown={(event) => event.stopPropagation()}
      />
    </Primitive.Portal>
  )
}

Tooltip.Trigger = TooltipTrigger
Tooltip.Content = TooltipContent
