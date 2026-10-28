import { useCallback, useMemo, useRef, useState } from 'react'

import { getTabbableElements } from './focusNavigation/getTabbableElements'

export function usePopoverState(
  open: boolean | undefined,
  defaultOpen: boolean | undefined,
  onOpenChange?: (open: boolean) => void,
  modal = false,
) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const destination = useRef<HTMLElement | null>(null)
  const setOpen = useCallback(
    (next: boolean) => {
      setInternalOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange],
  )
  const registerTrigger = useCallback((element: HTMLButtonElement | null) => {
    trigger.current = element
  }, [])
  const exitWithTab = useCallback(
    (content: HTMLElement, backwards: boolean) => {
      const controls = getTabbableElements(document).filter(
        (element) => !content.contains(element),
      )
      const index = trigger.current ? controls.indexOf(trigger.current) : -1
      destination.current = backwards
        ? trigger.current
        : (controls[index + 1] ?? trigger.current)
      setOpen(false)
      destination.current?.focus()
    },
    [setOpen],
  )
  const restoreAfterTab = useCallback((event: Event) => {
    if (!destination.current) return
    event.preventDefault()
    destination.current.focus()
    destination.current = null
  }, [])
  return useMemo(
    () => ({
      open: open ?? internalOpen,
      modal,
      setOpen,
      registerTrigger,
      exitWithTab,
      restoreAfterTab,
    }),
    [
      open,
      internalOpen,
      modal,
      setOpen,
      registerTrigger,
      exitWithTab,
      restoreAfterTab,
    ],
  )
}

export type PopoverState = ReturnType<typeof usePopoverState>
