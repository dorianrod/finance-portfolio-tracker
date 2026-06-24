import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  label: string
  content: string
}

export function ColHeader({ label, content }: Props) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const iconRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (visible && iconRef.current) {
      const r = iconRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 6, left: r.left })
    }
  }, [visible])

  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <span
        ref={iconRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="text-gray-600 hover:text-gray-300 cursor-help text-[10px] leading-none"
      >
        ⓘ
      </span>
      {visible &&
        createPortal(
          <div
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-[9999] w-72 p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-xl text-xs text-gray-200 leading-relaxed pointer-events-none"
          >
            {content}
          </div>,
          document.body
        )}
    </span>
  )
}
