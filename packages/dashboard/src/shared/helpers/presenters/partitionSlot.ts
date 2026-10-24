import {
  Children,
  type ComponentType,
  isValidElement,
  type ReactNode,
} from 'react'

/** Select only direct slot children; keep all other content in its original order. */
export function partitionSlot(
  children: ReactNode,
  slotType: ComponentType<{ children: ReactNode }>,
) {
  const slot: ReactNode[] = []
  const content: ReactNode[] = []
  Children.toArray(children).forEach((child) => {
    if (isValidElement(child) && child.type === slotType) {
      slot.push(child)
    } else {
      content.push(child)
    }
  })
  return { slot, content }
}
