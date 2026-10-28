import { useEffect, useRef } from 'react'

import { getTabbableElements } from './focusNavigation/getTabbableElements'

export function usePreviewFocus(interactive: boolean, anchor: DOMRect) {
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!interactive) return
    const content = contentRef.current
    if (content) (getTabbableElements(content)[0] ?? content).focus()
  }, [interactive, anchor])
  return contentRef
}
