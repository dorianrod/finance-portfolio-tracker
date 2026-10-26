import i18n from '@/i18n/i18n'

import { SegmentedControl, SegmentedControlItem } from './SegmentedControl.view'

export type ChartScaleMode = 'value' | 'percentage'

export function ChartScaleToggle({
  value,
  onChange,
}: {
  value: ChartScaleMode
  onChange: (value: ChartScaleMode) => void
}) {
  return (
    <div className="shrink-0">
      <SegmentedControl
        label={i18n.t('ui.chartscaletoggle.chartScale')}
        density="compact"
      >
        <SegmentedControlItem
          active={value === 'value'}
          tone="neutral"
          onClick={() => onChange('value')}
        >
          €
        </SegmentedControlItem>
        <SegmentedControlItem
          active={value === 'percentage'}
          tone="neutral"
          onClick={() => onChange('percentage')}
        >
          100%
        </SegmentedControlItem>
      </SegmentedControl>
    </div>
  )
}
