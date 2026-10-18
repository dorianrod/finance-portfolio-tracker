import { useId, useState } from 'react'

export function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)
  const tooltipId = useId()

  return (
    <span
      className="relative ml-1 inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <button
        type="button"
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-600 text-[9px] font-bold leading-none text-gray-300 transition-colors hover:bg-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label="More information"
        aria-describedby={visible ? tooltipId : undefined}
        aria-expanded={visible}
        onClick={() => setVisible(true)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setVisible(false)
            event.currentTarget.blur()
          }
        }}
      >
        i
      </button>
      {visible && (
        <span
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-gray-300 shadow-xl"
        >
          {text}
        </span>
      )}
    </span>
  )
}
