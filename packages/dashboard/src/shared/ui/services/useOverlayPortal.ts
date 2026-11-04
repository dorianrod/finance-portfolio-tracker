import { useEffectEvent, useLayoutEffect, useState } from 'react'

/** Remove nested portals synchronously when Activity hides their owner. */
export function useOverlayPortal(open: boolean, onDismiss: () => void) {
  const [container] = useState(() =>
    typeof document === 'undefined' ? null : document.createElement('div'),
  )
  const dismissIfHidden = useEffectEvent(() => {
    if (open && !container?.isConnected) onDismiss()
  })

  useLayoutEffect(() => {
    if (!open || !container) return
    document.body.appendChild(container)
    return () => {
      container.remove()
      // A StrictMode effect replay reconnects the container before this runs.
      queueMicrotask(dismissIfHidden)
    }
  }, [container, open])

  return container
}
