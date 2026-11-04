import type { ConcentrationMode } from '@/domains/portfolio/shared/types/concentrationMode.type'
import i18n from '@/i18n/i18n'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { SegmentedControl } from '@/shared/ui/segmentedControl/SegmentedControl.view'
import { SegmentedControlItem } from '@/shared/ui/segmentedControl/SegmentedControlItem.view'

export function ConcentrationModeToggle({
  value,
  onChange,
  lookThroughDisabled = false,
}: {
  value: ConcentrationMode
  onChange: (value: ConcentrationMode) => void
  lookThroughDisabled?: boolean
}) {
  return (
    <Layout sizing="fixed">
      <SegmentedControl
        label={i18n.t('ui.concentrationmodetoggle.concentrationMethod')}
        density="compact"
      >
        <SegmentedControlItem
          active={value === 'held'}
          size="compact"
          onClick={() => onChange('held')}
          title={i18n.t(
            'ui.concentrationmodetoggle.assetsEffectivelyHeldAtTheAllocationFileLevel',
          )}
        >
          {i18n.t('ui.concentrationmodetoggle.heldPositions')}
        </SegmentedControlItem>
        <SegmentedControlItem
          active={value === 'lookThrough'}
          size="compact"
          onClick={() => onChange('lookThrough')}
          disabled={lookThroughDisabled}
          title={
            lookThroughDisabled
              ? i18n.t(
                  'ui.concentrationmodetoggle.historicalUnderlyingHoldingsAreUnavailable',
                )
              : i18n.t(
                  'ui.concentrationmodetoggle.assetsHeldDirectlyAndThroughFunds',
                )
          }
        >
          {i18n.t('ui.concentrationmodetoggle.underlyingAssets')}
        </SegmentedControlItem>
      </SegmentedControl>
    </Layout>
  )
}
