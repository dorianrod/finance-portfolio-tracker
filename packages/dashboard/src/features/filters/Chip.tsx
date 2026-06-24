export function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer',
        active
          ? 'bg-blue-600 border-blue-500 text-white'
          : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-200',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
