import i18n from '@/i18n/i18n'
export function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        i18n.t('ui.chip.roundedFullBorderPx3Py15Text'),
        active
          ? 'border-accent-solid bg-accent-solid text-on-accent'
          : 'border-border-strong bg-surface-raised text-content-muted hover:bg-surface-hover hover:text-content-secondary',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
