import i18n from '@/i18n/i18n'

export function PositionBreakdownHeader() {
  return (
    <span
      title={i18n.t(
        'ui.positionstable.positionLevelAllocationAndUnderlyingExposureBreakdowns',
      )}
    >
      {i18n.t('ui.positionstable.breakdown')}
    </span>
  )
}
