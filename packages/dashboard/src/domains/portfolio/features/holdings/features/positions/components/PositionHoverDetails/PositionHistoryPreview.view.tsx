import type { ReactNode } from 'react'

import i18n from '@/i18n/i18n'
import { useFormatErrorMessage } from '@/shared/helpers/formatters/useFormatErrorMessage'
import { StatusMessage } from '@/shared/ui/controls/StatusMessage.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Preview } from '@/shared/ui/Preview.view'
import { Text } from '@/shared/ui/Text.view'

export function PositionHistoryPreview({
  anchor,
  name,
  description,
  descriptionVariant,
  pending,
  error,
  empty,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  anchor: DOMRect
  name: string
  description: string
  descriptionVariant: 'caption' | 'captionCode'
  pending: boolean
  // No request failure has been reported.
  error: Error | null
  empty: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  children: ReactNode
}) {
  const formatErrorMessage = useFormatErrorMessage()
  return (
    <Preview.Content
      anchor={anchor}
      label={name}
      variant="floatingPanel"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      size="wide"
    >
      <Layout overflow="scroll" inset="default">
        <Layout spaceAfter="default">
          <Text as="p" variant="bodyStrong" tone="default">
            {name}
          </Text>
          <Text as="p" variant={descriptionVariant} tone="subtle">
            {description}
          </Text>
        </Layout>
        {pending && (
          <StatusMessage variant="caption" tone="muted" align="center">
            <Layout as="span" flow="block" inset="default">
              {i18n.t('ui.hoverchart.loading')}
            </Layout>
          </StatusMessage>
        )}
        {error && (
          <StatusMessage
            urgent
            variant="caption"
            tone="negative"
            align="center"
          >
            <Layout as="span" flow="block" inset="default">
              {formatErrorMessage(error)}
            </Layout>
          </StatusMessage>
        )}
        {empty && (
          <StatusMessage variant="caption" tone="muted" align="center">
            <Layout as="span" flow="block" inset="default">
              {i18n.t('ui.hoverchart.noHistory')}
            </Layout>
          </StatusMessage>
        )}
        {children}
      </Layout>
    </Preview.Content>
  )
}
