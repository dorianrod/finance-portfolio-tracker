import { useCallback, useId, useMemo, useRef, useState } from 'react'

export function usePreviewState(
  open: boolean,
  onOpenChange: (open: boolean) => void,
  keepOpen?: () => void,
) {
  const id = useId()
  const [trigger, setTrigger] = useState<HTMLElement | null>(null)
  const [interactive, setInteractive] = useState(false)
  const activation = useRef<{
    trigger: HTMLElement | null
    interactive: boolean
  }>({ trigger: null, interactive: false })
  const restoringFocus = useRef(false)
  const activate = useCallback(
    (element: HTMLElement, nextInteractive: boolean) => {
      activation.current = { trigger: element, interactive: nextInteractive }
      setTrigger(element)
      setInteractive(nextInteractive)
    },
    [],
  )
  const consumeRestoredFocus = useCallback(() => {
    const restored = restoringFocus.current
    restoringFocus.current = false
    return restored
  }, [])
  const markContentFocus = useCallback(() => {
    activation.current.interactive = true
  }, [])
  const restoreFocus = useCallback(() => {
    const current = activation.current
    if (
      current.interactive &&
      current.trigger?.isConnected &&
      document.activeElement !== current.trigger
    ) {
      restoringFocus.current = true
      current.trigger.focus()
    }
  }, [])
  const close = useCallback(() => onOpenChange(false), [onOpenChange])
  return useMemo(
    () => ({
      id,
      open,
      interactive,
      trigger,
      activate,
      consumeRestoredFocus,
      markContentFocus,
      restoreFocus,
      close,
      keepOpen,
    }),
    [
      id,
      open,
      interactive,
      trigger,
      activate,
      consumeRestoredFocus,
      markContentFocus,
      restoreFocus,
      close,
      keepOpen,
    ],
  )
}

export type PreviewState = ReturnType<typeof usePreviewState>
