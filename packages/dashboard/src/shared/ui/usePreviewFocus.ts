import { useEffect, useRef } from 'react'

export function usePreviewFocus(interactive: boolean, anchor: DOMRect) {
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!interactive) return
    const target =
      contentRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), a[href], input, select, textarea',
      ) ?? contentRef.current
    target?.focus()
  }, [interactive, anchor])
  return contentRef
}
