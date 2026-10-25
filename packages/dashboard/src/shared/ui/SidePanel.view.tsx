import type { ReactNode } from 'react'
import { useId } from 'react'
import { createPortal } from 'react-dom'

import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'

// eslint-disable-next-line local/component-role -- This UI service owns focus and scrolling, without business state.
import { useSidePanelDialog } from './services/useSidePanelDialog'

type SidePanelProps = {
  open: boolean
  children: ReactNode
  onClose: () => void
  closeLabel: string
  size?: 'default' | 'medium' | 'wide'
  bodyClassName?: string
}

const WIDTH_BY_SIZE = {
  default: 'w-[min(92vw,480px)]',
  medium: 'w-[min(96vw,760px)]',
  wide: 'w-[min(100vw,1200px)]',
} as const

export function SidePanel({
  open,
  children,
  onClose,
  closeLabel,
  size = 'default',
  bodyClassName = 'overflow-auto',
}: SidePanelProps) {
  const titleId = useId()
  const { closeButtonRef, panelRef } = useSidePanelDialog(open, onClose)
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
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[9990]">
      <button
        type="button"
        tabIndex={-1}
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-overlay/45 backdrop-blur-xs"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-y-0 right-0 flex max-w-full flex-col border-l border-border-strong bg-surface shadow-2xl ${WIDTH_BY_SIZE[size]}`}
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-sm font-semibold text-content">
              {title}
            </h2>
            {description.length > 0 && (
              <div className="mt-0.5 text-xs text-content-subtle">
                {description}
              </div>
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
        <div className={`min-h-0 flex-1 ${bodyClassName}`}>{content}</div>
      </aside>
    </div>,
    document.body,
  )
}

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
