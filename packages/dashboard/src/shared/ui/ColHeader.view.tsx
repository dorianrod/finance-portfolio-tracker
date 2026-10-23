import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  label: string
  content: string
}

function useTooltipPosition(visible: boolean) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const anchorRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!visible || !anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setPosition({ top: rect.bottom + 6, left: rect.left })
  }, [visible])

  return { anchorRef, position }
}

export function ColHeader({ label, content }: Props) {
  const [visible, setVisible] = useState(false)
  const { anchorRef, position } = useTooltipPosition(visible)
  const tooltipId = useId()

  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <button
        type="button"
        ref={anchorRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setVisible(false)
            event.currentTarget.blur()
          }
        }}
        aria-label={`More information about ${label || 'this column'}`}
        aria-describedby={visible ? tooltipId : undefined}
        aria-expanded={visible}
        className="grid size-5 cursor-help place-items-center rounded-full text-[10px] leading-none text-content-subtle transition-colors hover:bg-surface-raised hover:text-content-secondary"
      >
        ⓘ
      </button>
      {visible &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            style={{ top: position.top, left: position.left }}
            className="pointer-events-none fixed z-[9999] w-72 rounded-control border border-border-strong bg-surface-raised p-3 text-xs leading-relaxed text-content-secondary shadow-xl"
          >
            {content}
          </div>,
          document.body
        )}
    </span>
  )
}
