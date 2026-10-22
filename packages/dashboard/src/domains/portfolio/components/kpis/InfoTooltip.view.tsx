import { useId, useState, type ReactNode } from 'react'

export function InfoTooltip({ text, footer }: { text: ReactNode; footer?: ReactNode }) {
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
        className="flex size-5 items-center justify-center rounded-full border border-border-strong bg-surface-raised text-[10px] font-bold leading-none text-content-muted transition-colors hover:bg-surface-hover hover:text-content-secondary"
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
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-control border border-border-strong bg-surface-raised px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-content-secondary shadow-xl"
        >
          <span className="block">{text}</span>
          {footer && (
            <span className="mt-2.5 block border-t border-border-strong pt-2">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-content-subtle">Filter scope</span>
              {footer}
            </span>
          )}
        </span>
      )}
    </span>
  )
}
