import i18n from '@/i18n/i18n'
import { DecorativeSvg, ToggleButton } from '@/shared/ui/Controls.view'
export function PositionsToggle({
  open,
  onClick,
}: {
  open: boolean
  onClick: () => void
}) {
  return (
    <ToggleButton
      type="button"
      onClick={onClick}
      active={open}
      title={
        open
          ? i18n.t('ui.positionstoggle.hidePositions')
          : i18n.t('ui.positionstoggle.viewPositions')
      }
      className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
        open
          ? 'border-accent bg-accent-solid text-content'
          : 'border-border-strong text-content-muted hover:border-border-strong hover:bg-surface-raised hover:text-content-secondary'
      }`}
    >
      <DecorativeSvg
        width="13"
        height="13"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <rect x="1" y="1" width="6" height="6" rx="1" opacity=".7" />
        <rect x="9" y="1" width="6" height="6" rx="1" opacity=".7" />
        <rect x="1" y="9" width="6" height="6" rx="1" opacity=".7" />
        <rect x="9" y="9" width="6" height="6" rx="1" opacity=".7" />
      </DecorativeSvg>

      {i18n.t('ui.positionstoggle.positions')}
    </ToggleButton>
  )
}
