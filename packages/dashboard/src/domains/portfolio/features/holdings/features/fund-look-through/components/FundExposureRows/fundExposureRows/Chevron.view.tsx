import { TreeChevronIcon } from '@/shared/ui/icons/TreeChevronIcon.view'

export function Chevron({ open }: { open: boolean }) {
  return <TreeChevronIcon expanded={open} />
}
