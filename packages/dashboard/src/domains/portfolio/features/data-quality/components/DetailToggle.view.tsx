import i18n from '@/i18n/i18n'
import { DecorativeSvg } from '@/shared/ui/Controls.view'
import { Disclosure } from '@/shared/ui/Disclosure.view'

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
      className="mt-3 flex w-full items-center justify-between gap-3 border-t border-border pt-3 text-xs font-medium text-accent transition-colors hover:text-accent"
      onClick={onClick}
    >
      <span>
        {expanded
          ? i18n.t('ui.allocationcoveragecard.hideValue0', {
              value0: label.toLowerCase(),
            })
          : label}
      </span>
      <DecorativeSvg
        className={`h-3.5 w-3.5 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"
          clipRule="evenodd"
        />
      </DecorativeSvg>
    </Disclosure.Trigger>
  )
}
