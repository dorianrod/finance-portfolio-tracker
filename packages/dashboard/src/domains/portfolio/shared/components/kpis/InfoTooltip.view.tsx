import type { ReactNode } from 'react'

import i18n from '@/i18n/i18n'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'
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
          variant="info"
        >
          {i18n.t('ui.infotooltip.i')}
        </Tooltip.Trigger>
        <Tooltip.Content side="top" variant="info" className="w-72">
          <span className="block">{text}</span>
          {children}
        </Tooltip.Content>
      </Tooltip>
    </span>
  )
}

function InfoTooltipFooter({ children }: { children: ReactNode }) {
  return (
    <Surface
      as="span"
      variant="strongSectionStart"
      className="mt-2.5 block pt-2"
    >
      <Text variant="eyebrow" tone="subtle" className="block">
        {i18n.t('ui.infotooltip.filterScope')}
      </Text>
      {children}
    </Surface>
  )
}

InfoTooltip.Footer = InfoTooltipFooter
