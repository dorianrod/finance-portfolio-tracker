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
    <span className="inline-grid shrink-0">
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
      >
        <GridIcon />

        {i18n.t('ui.positionstoggle.positions')}
      </ToggleButton>
    </span>
  )
}
