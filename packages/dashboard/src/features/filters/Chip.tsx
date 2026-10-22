export function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-accent-solid bg-accent-solid text-on-accent'
          : 'border-border-strong bg-surface-raised text-content-muted hover:bg-surface-hover hover:text-content-secondary',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
