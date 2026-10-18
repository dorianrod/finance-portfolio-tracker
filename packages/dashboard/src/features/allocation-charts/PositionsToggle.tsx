export function PositionsToggle({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={open}
      title={open ? 'Hide positions' : 'View positions'}
      className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
        open
          ? 'border-blue-500 bg-blue-600 text-white'
          : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800 hover:text-gray-200'
      }`}
    >
      <svg aria-hidden="true" width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="1" width="6" height="6" rx="1" opacity=".7" />
        <rect x="9" y="1" width="6" height="6" rx="1" opacity=".7" />
        <rect x="1" y="9" width="6" height="6" rx="1" opacity=".7" />
        <rect x="9" y="9" width="6" height="6" rx="1" opacity=".7" />
      </svg>
      Positions
    </button>
  )
}
