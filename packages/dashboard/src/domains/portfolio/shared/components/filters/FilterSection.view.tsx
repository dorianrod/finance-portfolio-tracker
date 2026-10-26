import type { ReactNode } from 'react'

import { Layout } from '@/shared/ui/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

export function FilterSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Surface as="section" variant="formSection">
      <Text as="h3" variant="bodyStrong" tone="secondary">
        {title}
      </Text>
      {description && (
        <Layout spaceBefore="compact">
          <Text as="p" variant="helper" tone="subtle">
            {description}
          </Text>
        </Layout>
      )}
      <Layout spaceBefore="default">{children}</Layout>
    </Surface>
  )
}
