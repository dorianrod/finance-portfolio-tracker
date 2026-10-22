import { SegmentedControl, SegmentedControlItem } from '@/shared/ui/SegmentedControl.view'

export type ConcentrationMode = 'held' | 'lookThrough'

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
    <SegmentedControl label="Concentration method" density="compact" className="shrink-0">
      <SegmentedControlItem
        active={value === 'held'}
        size="compact"
        onClick={() => onChange('held')}
        title="Assets effectively held, at the allocation-file level"
      >
        Held positions
      </SegmentedControlItem>
      <SegmentedControlItem
        active={value === 'lookThrough'}
        size="compact"
        onClick={() => onChange('lookThrough')}
        disabled={lookThroughDisabled}
        title={lookThroughDisabled ? 'Historical underlying holdings are unavailable' : 'Assets held directly and through funds'}
      >
        Underlying assets
      </SegmentedControlItem>
    </SegmentedControl>
  )
}
