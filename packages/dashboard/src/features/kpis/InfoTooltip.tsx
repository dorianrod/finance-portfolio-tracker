import { useState } from 'react'

export function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="w-3.5 h-3.5 rounded-full bg-gray-600 text-gray-300 text-[9px] font-bold leading-none flex items-center justify-center hover:bg-gray-500 transition-colors"
        tabIndex={-1}
      >
        i
      </button>
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-xs text-gray-300 shadow-xl pointer-events-none">
          {text}
        </div>
      )}
    </span>
  )
}
