import { SegmentedControl, SegmentedControlItem } from '@/shared/ui/SegmentedControl'

export type AllocationView = 'current' | 'trend'

interface AllocationViewToggleProps {
  value: AllocationView
  onChange: (view: AllocationView) => void
}

export function AllocationViewToggle({ value, onChange }: AllocationViewToggleProps) {
  return (
    <SegmentedControl label="Diversification view">
      <SegmentedControlItem
        active={value === 'current'}
        onClick={() => onChange('current')}
      >
        Current
      </SegmentedControlItem>
      <SegmentedControlItem
        active={value === 'trend'}
        onClick={() => onChange('trend')}
      >
        Trend
      </SegmentedControlItem>
    </SegmentedControl>
  )
}
