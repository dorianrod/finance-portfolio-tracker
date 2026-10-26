import i18n from '@/i18n/i18n'
import { Disclosure } from '@/shared/ui/Disclosure.view'
import { DisclosureChevronIcon } from '@/shared/ui/Icons.view'
import { Layout } from '@/shared/ui/Layout.view'

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
    <Layout as="span" flow="inline" spaceBefore="default" width="full">
      <Disclosure.Trigger
        type="button"
        variant="detailToggle"
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
    </Layout>
  )
}
