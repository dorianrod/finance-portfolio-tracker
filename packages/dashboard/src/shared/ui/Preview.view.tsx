import * as Primitive from '@radix-ui/react-popover'
import { useAtomValue } from 'jotai'
import { ScopeProvider } from 'jotai-scope'
import { type HTMLAttributes, type ReactNode, useMemo, useRef } from 'react'

import type { ButtonProps } from '@/shared/ui/controls/controls.types'
import { PREVIEW_SIZES } from '@/shared/ui/layoutAppearance/previewSizes'
import { useScopedInput } from '@/shared/ui/services/useScopedInput'
import { previewInputAtom } from '@/shared/ui/stores/previewInput.atoms'
import { SURFACE_VARIANTS } from '@/shared/ui/surfaceAppearance/surfaceVariants'
import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'

import type { ControlProps } from './controlProps'
import { getTabbableElements } from './focusNavigation/getTabbableElements'
import { getPreviewTriggerClassName } from './preview/helpers/presenters/getPreviewTriggerClassName'
import { usePreviewTriggerInteractions } from './services/usePreviewTriggerInteractions'
import { usePreviewFocus } from './usePreviewFocus'
import { usePreviewState } from './usePreviewState'

export function Preview({
  open,
  onOpenChange,
  onKeepOpen,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onKeepOpen?: () => void
  children: ReactNode
}) {
  const context = usePreviewState(open, onOpenChange, onKeepOpen)
  const scope = useScopedInput(previewInputAtom, context)
  return (
    <ScopeProvider scope={scope}>
      <Primitive.Root open={open} onOpenChange={onOpenChange}>
        {children}
      </Primitive.Root>
    </ScopeProvider>
  )
}

function PreviewTrigger({
  onPreview,
  onDismiss,
  expanded,
  label,
  type = 'button',
  variant,
  selected,
  size,
  onIntent,
  dimmed,
  tone,
  ...props
}: ButtonProps & {
  onPreview: (anchor: HTMLButtonElement) => void
  onDismiss: () => void
  expanded?: boolean
  tone?: TextTone
}) {
  const interactions = usePreviewTriggerInteractions({
    id: props.id,
    expanded,
    onPreview,
    onDismiss,
    onIntent,
    onMouseEnter: props.onMouseEnter,
    onMouseLeave: props.onMouseLeave,
    onClick: props.onClick,
  })
  return (
    <button
      {...props}
      type={type}
      className={getPreviewTriggerClassName({
        variant,
        selected,
        size,
        dimmed,
        tone,
      })}
      aria-label={label}
      {...interactions}
    />
  )
}

function PreviewContent({
  anchor,
  size = 'default',
  label,
  children,
  variant,
  ...props
}: ControlProps<HTMLAttributes<HTMLDivElement>> & {
  variant?: keyof typeof SURFACE_VARIANTS
  size?: keyof typeof PREVIEW_SIZES
  anchor: DOMRect
  label: string
}) {
  const context = useAtomValue(previewInputAtom)
  const contentRef = usePreviewFocus(context?.interactive ?? false, anchor)
  const restoreFocus = useRef(true)
  const virtualRef = useMemo(
    () => ({ current: { getBoundingClientRect: () => anchor } }),
    [anchor],
  )
  if (!context) throw new Error('Preview.Content requires Preview.')
  return (
    <>
      <Primitive.Anchor virtualRef={virtualRef} />
      <Primitive.Portal>
        <Primitive.Content
          {...props}
          ref={contentRef}
          className={[
            'z-[9999] overflow-y-auto p-4',
            PREVIEW_SIZES[size],
            variant && SURFACE_VARIANTS[variant],
          ]
            .filter(Boolean)
            .join(' ')}
          id={context.id}
          aria-label={label}
          sideOffset={6}
          collisionPadding={8}
          style={{
            maxHeight: 'var(--radix-popover-content-available-height)',
          }}
          onOpenAutoFocus={(event) => {
            restoreFocus.current = true
            event.preventDefault()
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            if (restoreFocus.current) context.restoreFocus()
          }}
          onInteractOutside={(event) => {
            if (event.target === context.trigger) event.preventDefault()
            else restoreFocus.current = false
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Tab') return
            const controls = getTabbableElements(event.currentTarget)
            const boundary = event.shiftKey ? controls[0] : controls.at(-1)
            if (!boundary || document.activeElement === boundary) {
              event.preventDefault()
              restoreFocus.current = false
              context.exitWithTab(event.currentTarget, event.shiftKey)
            }
          }}
          onFocusCapture={() => {
            context.markContentFocus()
            context.keepOpen?.()
          }}
          onMouseLeave={(event) => {
            if (!event.currentTarget.contains(document.activeElement))
              props.onMouseLeave?.(event)
          }}
          onEscapeKeyDown={(event) => event.stopPropagation()}
        >
          {children}
        </Primitive.Content>
      </Primitive.Portal>
    </>
  )
}

Preview.Trigger = PreviewTrigger
Preview.Content = PreviewContent
