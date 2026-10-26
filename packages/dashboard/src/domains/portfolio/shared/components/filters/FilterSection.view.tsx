import type { ReactNode } from 'react'

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
    <Surface as="section" variant="formSection" className="px-4 py-5">
      <Text as="h3" variant="bodyStrong" tone="secondary">
        {title}
      </Text>
      {description && (
        <Text as="p" variant="helper" tone="subtle" className="mt-1">
          {description}
        </Text>
      )}
      <div className="mt-3">{children}</div>
    </Surface>
  )
}
