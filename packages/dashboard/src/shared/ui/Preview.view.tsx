import * as Primitive from '@radix-ui/react-popover'
import {
  createContext,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useId,
  useMemo,
  useRef,
} from 'react'

import { getButtonClassName } from './buttonAppearance'
import type { ControlProps } from './controlProps'
import type { ButtonProps } from './Controls.view'
import { SURFACE_VARIANTS } from './surfaceAppearance'
import type { TextTone } from './textAppearance'
import { TEXT_TONES } from './textAppearance'
import { usePreviewFocus } from './usePreviewFocus'
import { type PreviewState, usePreviewState } from './usePreviewState'

const PreviewContext = createContext<PreviewState | null>(null)

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
  return (
    <PreviewContext value={context}>
      <Primitive.Root open={open} onOpenChange={onOpenChange}>
        {children}
      </Primitive.Root>
    </PreviewContext>
  )
}

function PreviewTrigger({
  onPreview,
  onDismiss,
  expanded,
  label,
  type = 'button',
  variant = 'plain',
  selected = false,
  tone,
  className,
  ...props
}: ButtonProps & {
  onPreview: (anchor: HTMLButtonElement) => void
  onDismiss: () => void
  expanded?: boolean
  tone?: TextTone
}) {
  const context = useContext(PreviewContext)
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
        getButtonClassName(variant, className, selected),
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
      onMouseEnter={(event) => show(event.currentTarget, false)}
      onMouseLeave={() => {
        if (
          document.activeElement !== context.trigger &&
          !document.getElementById(context.id)?.contains(document.activeElement)
        )
          onDismiss()
      }}
      onFocus={(event) => {
        if (context.consumeRestoredFocus()) return
        show(event.currentTarget, false)
      }}
      onBlur={(event) => {
        if (!document.getElementById(context.id)?.contains(event.relatedTarget))
          onDismiss()
      }}
      onClick={(event) => {
        event.stopPropagation()
        show(event.currentTarget, event.detail === 0)
        props.onClick?.(event)
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
  label,
  children,
  style,
  variant,
  className,
  ...props
}: ControlProps<HTMLAttributes<HTMLDivElement>> & {
  variant?: keyof typeof SURFACE_VARIANTS
  anchor: DOMRect
  label: string
  style?: CSSProperties
}) {
  const context = useContext(PreviewContext)
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
          className={[variant && SURFACE_VARIANTS[variant], className]
            .filter(Boolean)
            .join(' ')}
          id={context.id}
          aria-label={label}
          sideOffset={6}
          collisionPadding={8}
          style={{
            maxHeight: 'var(--radix-popover-content-available-height)',
            ...style,
          }}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            if (restoreFocus.current) context.restoreFocus()
          }}
          onInteractOutside={(event) => {
            if (event.target === context.trigger) event.preventDefault()
            else restoreFocus.current = false
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
