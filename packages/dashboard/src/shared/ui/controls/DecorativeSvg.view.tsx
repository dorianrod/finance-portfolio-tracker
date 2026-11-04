import type { SVGProps } from 'react'

import type { ControlProps } from '@/shared/ui/controlProps'

export function DecorativeSvg(props: ControlProps<SVGProps<SVGSVGElement>>) {
  return <svg {...props} aria-hidden="true" focusable="false" />
}
