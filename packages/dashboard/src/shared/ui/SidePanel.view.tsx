import * as Dialog from '@radix-ui/react-dialog'
import { type ReactNode, useRef } from 'react'

import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'
import { useOverlayPortal } from '@/shared/ui/services/useOverlayPortal'

export function SidePanel({
  open,
  children,
  onClose,
  closeLabel,
  size = 'default',
  scroll = 'both',
}: SidePanelProps) {
  const container = useOverlayPortal(open, onClose)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const { slot: title, content: afterTitle } = partitionSlot(
    children,
    SidePanelTitle,
  )
  const { slot: description, content: afterDescription } = partitionSlot(
    afterTitle,
    SidePanelDescription,
  )
  const { slot: headerActions, content } = partitionSlot(
    afterDescription,
    SidePanelHeaderActions,
  )
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose()
      }}
    >
      <Dialog.Portal container={container}>
        <Dialog.Overlay className="fixed inset-0 z-[9990] bg-overlay/45 backdrop-blur-xs" />
        <Dialog.Content
          {...(description.length === 0
            ? { 'aria-describedby': undefined }
            : {})}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            previouslyFocused.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null
            closeButtonRef.current?.focus()
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            previouslyFocused.current?.focus()
          }}
          className={`fixed inset-y-0 right-0 z-[9991] flex max-w-full flex-col border-l border-border-strong bg-surface shadow-2xl ${WIDTH_BY_SIZE[size]}`}
        >
          <div className="flex shrink-0 items-start gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-sm font-semibold text-content">
                {title}
              </Dialog.Title>
              {description.length > 0 && (
                <Dialog.Description asChild>
                  <div className="mt-0.5 text-xs text-content-subtle">
                    {description}
                  </div>
                </Dialog.Description>
              )}
            </div>
            {headerActions}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="grid size-8 shrink-0 place-items-center rounded-control text-lg leading-none text-content-subtle transition-colors hover:bg-surface-raised hover:text-content-secondary"
            >
              ✕
            </button>
          </div>
          <div
            className={`min-h-0 flex-1 ${scroll === 'vertical' ? 'overflow-y-auto overflow-x-hidden' : 'overflow-auto'}`}
          >
            {content}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

type SidePanelProps = {
  open: boolean
  children: ReactNode
  onClose: () => void
  closeLabel: string
  size?: 'default' | 'medium' | 'wide'
  scroll?: 'both' | 'vertical'
}

const WIDTH_BY_SIZE = {
  default: 'w-[min(92vw,480px)]',
  medium: 'w-[min(96vw,760px)]',
  wide: 'w-[min(100vw,1200px)]',
} as const

function SidePanelTitle({ children }: { children: ReactNode }) {
  return children
}

function SidePanelDescription({ children }: { children: ReactNode }) {
  return children
}

function SidePanelHeaderActions({ children }: { children: ReactNode }) {
  return children
}

SidePanel.Title = SidePanelTitle
SidePanel.Description = SidePanelDescription
SidePanel.HeaderActions = SidePanelHeaderActions
