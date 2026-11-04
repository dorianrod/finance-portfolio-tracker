import i18n from '@/i18n/i18n'
import { Button } from '@/shared/ui/controls/Button.view'

export function ResetFiltersButton({ onReset }: { onReset: () => void }) {
  return (
    <Button type="button" onClick={onReset} variant="text">
      {i18n.t('ui.filterbar.resetAll')}
    </Button>
  )
}
