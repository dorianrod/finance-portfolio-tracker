import i18n from '@/i18n/i18n'
import { Disclosure } from '@/shared/ui/Disclosure.view'
import { DisclosureChevronIcon } from '@/shared/ui/Icons.view'

export function DetailToggle({
  label,
  expanded,
  onClick,
}: {
  label: string
  expanded: boolean
  onClick: () => void
}) {
  return (
    <Disclosure.Trigger
      type="button"
      variant="detailToggle"
      className="mt-3 flex w-full items-center justify-between gap-3 pt-3"
      onClick={onClick}
    >
      <span>
        {expanded
          ? i18n.t('ui.allocationcoveragecard.hideValue0', {
              value0: label.toLowerCase(),
            })
          : label}
      </span>
      <DisclosureChevronIcon expanded={expanded} />
    </Disclosure.Trigger>
  )
}
