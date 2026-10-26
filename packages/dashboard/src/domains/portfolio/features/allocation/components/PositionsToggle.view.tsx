import i18n from '@/i18n/i18n'
import { ToggleButton } from '@/shared/ui/Controls.view'
import { GridIcon } from '@/shared/ui/Icons.view'
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
      variant="positions"
      className="flex shrink-0 items-center gap-1.5 px-2.5 py-1"
    >
      <GridIcon />

      {i18n.t('ui.positionstoggle.positions')}
    </ToggleButton>
  )
}
