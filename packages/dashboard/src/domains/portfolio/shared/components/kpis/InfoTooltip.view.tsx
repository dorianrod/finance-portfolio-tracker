import type { ReactNode } from 'react'

import i18n from '@/i18n/i18n'
import { Tooltip } from '@/shared/ui/Tooltip.view'

export function InfoTooltip({
  text,
  children,
}: {
  text: string
  children?: ReactNode
}) {
  return (
    <span className="relative ml-1 inline-flex items-center">
      <Tooltip>
        <Tooltip.Trigger
          label={i18n.t('ui.infotooltip.moreInformation')}
          className="flex size-5 items-center justify-center rounded-full border border-border-strong bg-surface-raised text-[10px] font-bold leading-none text-content-muted transition-colors hover:bg-surface-hover hover:text-content-secondary"
        >
          {i18n.t('ui.infotooltip.i')}
        </Tooltip.Trigger>
        <Tooltip.Content
          side="top"
          className="w-72 text-left font-normal normal-case leading-relaxed tracking-normal"
        >
          <span className="block">{text}</span>
          {children}
        </Tooltip.Content>
      </Tooltip>
    </span>
  )
}

function InfoTooltipFooter({ children }: { children: ReactNode }) {
  return (
    <span className="mt-2.5 block border-t border-border-strong pt-2">
      <span className="block text-[10px] font-semibold uppercase tracking-wider text-content-subtle">
        {i18n.t('ui.infotooltip.filterScope')}
      </span>
      {children}
    </span>
  )
}

InfoTooltip.Footer = InfoTooltipFooter
