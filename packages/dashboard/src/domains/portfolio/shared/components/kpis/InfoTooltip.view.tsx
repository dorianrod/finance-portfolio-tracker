import type { ReactNode } from 'react'

import i18n from '@/i18n/i18n'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
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
    <Inline as="span" placement="inset" align="center">
      <Tooltip>
        <Tooltip.Trigger
          label={i18n.t('ui.infotooltip.moreInformation')}
          variant="info"
        >
          {i18n.t('ui.infotooltip.i')}
        </Tooltip.Trigger>
        <Tooltip.Content side="top" variant="info">
          <Layout as="span" flow="block">
            {text}
          </Layout>
          {children}
        </Tooltip.Content>
      </Tooltip>
    </Inline>
  )
}

function InfoTooltipFooter({ children }: { children: ReactNode }) {
  return (
    <Layout as="span" flow="block" spaceBefore="default">
      <Surface as="span" variant="strongSectionStart">
        <Text variant="eyebrow" tone="subtle">
          <Layout as="span" flow="block">
            {i18n.t('ui.infotooltip.filterScope')}
          </Layout>
        </Text>
        {children}
      </Surface>
    </Layout>
  )
}

InfoTooltip.Footer = InfoTooltipFooter
