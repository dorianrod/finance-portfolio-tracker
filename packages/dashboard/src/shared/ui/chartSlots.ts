import {
  Children,
  type ComponentType,
  isValidElement,
  type ReactNode,
  type SVGProps,
} from 'react'

import { partitionSlot } from '@/shared/helpers/presenters/partitionSlot'

export function partitionChartSlot<
  TProps = Omit<SVGProps<SVGElement>, 'className'>,
>(children: ReactNode, slotType: ComponentType<{ children: ReactNode }>) {
  const { slot, content } = partitionSlot(children, slotType)
  if (slot.length === 0) return { content, renderer: undefined }
  if (slot.length !== 1)
    throw new Error('A chart renderer slot must be supplied once.')
  const wrapper = Children.only(slot[0])
  if (!isValidElement<{ children: ReactNode }>(wrapper))
    throw new Error('A chart renderer slot must be an element.')
  const renderer = Children.only(wrapper.props.children)
  if (!isValidElement<TProps>(renderer))
    throw new Error(
      'A chart renderer slot must contain one SVG renderer element.',
    )
  return { content, renderer }
}
