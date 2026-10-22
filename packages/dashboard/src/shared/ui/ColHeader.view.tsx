import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  label: string
  content: string
}

export function ColHeader({ label, content }: Props) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const iconRef = useRef<HTMLButtonElement>(null)
  const tooltipId = useId()

  useEffect(() => {
    if (visible && iconRef.current) {
      const r = iconRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 6, left: r.left })
    }
  }, [visible])

  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <button
        type="button"
        ref={iconRef}
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
            style={{ top: pos.top, left: pos.left }}
            className="pointer-events-none fixed z-[9999] w-72 rounded-control border border-border-strong bg-surface-raised p-3 text-xs leading-relaxed text-content-secondary shadow-xl"
          >
            {content}
          </div>,
          document.body
        )}
    </span>
  )
}
