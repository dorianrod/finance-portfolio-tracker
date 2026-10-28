import * as Primitive from '@radix-ui/react-popover'
import { useAtomValue } from 'jotai'
import { ScopeProvider } from 'jotai-scope'
import {
  type HTMLAttributes,
  type ReactNode,
  useId,
  useMemo,
  useRef,
} from 'react'

import { getButtonClassName } from '@/shared/ui/buttonAppearance/getButtonClassName'
import type { ButtonProps } from '@/shared/ui/controls/controls.types'
import { BUTTON_SIZES } from '@/shared/ui/layoutAppearance/buttonSizes'
import { PREVIEW_SIZES } from '@/shared/ui/layoutAppearance/previewSizes'
import { useScopedInput } from '@/shared/ui/services/useScopedInput'
import { previewInputAtom } from '@/shared/ui/stores/previewInputAtom'
import { SURFACE_VARIANTS } from '@/shared/ui/surfaceAppearance/surfaceVariants'
import type { TextTone } from '@/shared/ui/textAppearance/textAppearance.types'
import { TEXT_TONES } from '@/shared/ui/textAppearance/textTones'

import type { ControlProps } from './controlProps'
import { getTabbableElements } from './focusNavigation/getTabbableElements'
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

// eslint-disable-next-line complexity -- reviewed: 2026-10-28; Pointer, keyboard and restored-focus behavior form one accessible preview-trigger protocol; unmasking confirms complexity 19, and the interaction tests exercise cancellation and focus restoration.
function PreviewTrigger({
  onPreview,
  onDismiss,
  expanded,
  label,
  type = 'button',
  variant = 'plain',
  selected = false,
  size = 'compact',
  onIntent,
  dimmed = false,
  tone,
  ...props
}: ButtonProps & {
  onPreview: (anchor: HTMLButtonElement) => void
  onDismiss: () => void
  expanded?: boolean
  tone?: TextTone
}) {
  const context = useAtomValue(previewInputAtom)
  const triggerId = useId()
  if (!context) throw new Error('Preview.Trigger requires Preview.')
  function show(element: HTMLButtonElement, interactive: boolean) {
    context!.activate(element, interactive)
    onPreview(element)
  }
  return (
    <button
      {...props}
      type={type}
      className={[
        getButtonClassName(variant, selected),
        BUTTON_SIZES[size],
        'gap-2',
        dimmed && 'opacity-[0.35]',
        tone && TEXT_TONES[tone],
        tone &&
          'rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1',
        tone && PREVIEW_TONES[tone],
        selected && tone && 'bg-surface-raised ring-1 ring-current/40',
      ]
        .filter(Boolean)
        .join(' ')}
      id={props.id ?? triggerId}
      aria-label={label}
      aria-haspopup="dialog"
      aria-controls={context.open ? context.id : undefined}
      aria-expanded={
        expanded ??
        (context.open && context.trigger?.id === (props.id ?? triggerId))
      }
      onMouseEnter={(event) => {
        props.onMouseEnter?.(event)
        if (event.defaultPrevented) return
        onIntent?.()
        show(event.currentTarget, false)
      }}
      onMouseLeave={(event) => {
        props.onMouseLeave?.(event)
        if (event.defaultPrevented) return
        if (
          document.activeElement !== context.trigger &&
          !document.getElementById(context.id)?.contains(document.activeElement)
        )
          onDismiss()
      }}
      onFocus={(event) => {
        if (context.consumeRestoredFocus()) return
        onIntent?.()
        show(event.currentTarget, false)
      }}
      onBlur={(event) => {
        if (!document.getElementById(context.id)?.contains(event.relatedTarget))
          onDismiss()
      }}
      onClick={(event) => {
        event.stopPropagation()
        props.onClick?.(event)
        if (event.defaultPrevented) return
        show(event.currentTarget, event.detail === 0)
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'ArrowDown' && context.open) {
          event.preventDefault()
          context.activate(event.currentTarget, true)
        }
        if (event.key === 'Escape' && context.open) {
          event.stopPropagation()
          context.close()
        }
      }}
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

const PREVIEW_TONES: Partial<Record<TextTone, string>> = {
  positive:
    'hover:bg-positive-muted/60 hover:text-positive focus-visible:ring-positive',
  warning:
    'hover:bg-warning-muted/60 hover:text-warning focus-visible:ring-warning',
  negative:
    'hover:bg-danger-muted/60 hover:text-danger focus-visible:ring-danger',
}
