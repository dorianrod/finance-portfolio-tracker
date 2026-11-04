import { ChoiceChip } from '@/shared/ui/ChoiceChip.view'

export function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <ChoiceChip onClick={onClick} active={active}>
      {label}
    </ChoiceChip>
  )
}
