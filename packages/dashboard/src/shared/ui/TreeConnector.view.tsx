import type { ReactNode } from 'react'

import { TREE_CONNECTOR_POSITIONS } from '@/shared/ui/layoutAppearance/treeConnectorPositions'

export function TreeConnector({
  position,
  children,
}: {
  position: keyof typeof TREE_CONNECTOR_POSITIONS
  children: ReactNode
}) {
  return <div className={TREE_CONNECTOR_POSITIONS[position]}>{children}</div>
}
