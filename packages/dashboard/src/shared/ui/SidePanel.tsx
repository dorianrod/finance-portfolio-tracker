import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface SidePanelProps {
  title: ReactNode
  description?: ReactNode
  headerActions?: ReactNode
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
  title,
  description,
  headerActions,
  children,
  onClose,
  closeLabel,
  size = 'default',
  bodyClassName = 'overflow-auto',
}: SidePanelProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseRef.current()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [])

  return createPortal(
    <div className="fixed inset-0 z-[9990]">
      <button
        type="button"
        tabIndex={-1}
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-[1px]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-y-0 right-0 flex max-w-full flex-col border-l border-gray-700 bg-gray-900 shadow-2xl ${WIDTH_BY_SIZE[size]}`}
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-gray-800 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-sm font-semibold text-white">{title}</h2>
            {description && <div className="mt-0.5 text-xs text-gray-500">{description}</div>}
          </div>
          {headerActions}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="shrink-0 text-lg leading-none text-gray-500 transition-colors hover:text-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            ✕
          </button>
        </div>
        <div className={`min-h-0 flex-1 ${bodyClassName}`}>
          {children}
        </div>
      </aside>
    </div>,
    document.body,
  )
}
