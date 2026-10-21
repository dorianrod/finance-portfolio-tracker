import { useId, useState, type ReactNode } from 'react'
import { FilterScopeBadges, type FilterScopeSpec } from '@/shared/ui/FilterScopeBadges'

export function InfoTooltip({ text, scope }: { text: ReactNode; scope?: FilterScopeSpec }) {
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
        className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-600 bg-gray-800 text-[10px] font-bold leading-none text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-gray-300 shadow-xl"
        >
          <span className="block">{text}</span>
          {scope && (
            <span className="mt-2.5 block border-t border-gray-700 pt-2">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Filter scope</span>
              <FilterScopeBadges {...scope} />
            </span>
          )}
        </span>
      )}
    </span>
  )
}
