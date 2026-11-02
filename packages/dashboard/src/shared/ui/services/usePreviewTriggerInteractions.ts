import { useAtomValue } from 'jotai'
import { type ButtonHTMLAttributes, type KeyboardEvent, useId } from 'react'

import type { ButtonProps } from '@/shared/ui/controls/controls.types'
import { previewInputAtom } from '@/shared/ui/stores/previewInput.atoms'

export function usePreviewTriggerInteractions({
  id,
  expanded,
  onPreview,
  onDismiss,
  onIntent,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: Pick<
  ButtonProps,
  'id' | 'onIntent' | 'onMouseEnter' | 'onMouseLeave' | 'onClick'
> & {
  expanded?: boolean
  onPreview: (anchor: HTMLButtonElement) => void
  onDismiss: () => void
}): ButtonHTMLAttributes<HTMLButtonElement> {
  const context = useAtomValue(previewInputAtom)
  const generatedId = useId()
  const triggerId = id ?? generatedId
  if (!context) throw new Error('Preview.Trigger requires Preview.')
  const show = (element: HTMLButtonElement, interactive: boolean) => {
    context.activate(element, interactive)
    onPreview(element)
  }
  return {
    id: triggerId,
    'aria-haspopup': 'dialog',
    'aria-controls': context.open ? context.id : undefined,
    'aria-expanded':
      expanded ?? (context.open && context.trigger?.id === triggerId),
    onMouseEnter: (event) => {
      onMouseEnter?.(event)
      if (event.defaultPrevented) return
      onIntent?.()
      show(event.currentTarget, false)
    },
    onMouseLeave: (event) => {
      onMouseLeave?.(event)
      if (event.defaultPrevented) return
      if (
        document.activeElement !== context.trigger &&
        !document.getElementById(context.id)?.contains(document.activeElement)
      )
        onDismiss()
    },
    onFocus: (event) => {
      if (context.consumeRestoredFocus()) return
      onIntent?.()
      show(event.currentTarget, false)
    },
    onBlur: (event) => {
      if (!document.getElementById(context.id)?.contains(event.relatedTarget))
        onDismiss()
    },
    onClick: (event) => {
      event.stopPropagation()
      onClick?.(event)
      if (event.defaultPrevented) return
      show(event.currentTarget, event.detail === 0)
    },
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'ArrowDown' && context.open) {
        event.preventDefault()
        context.activate(event.currentTarget, true)
      }
      if (event.key === 'Escape' && context.open) {
        event.stopPropagation()
        context.close()
      }
    },
  }
}
