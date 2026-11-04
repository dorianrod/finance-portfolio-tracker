import type { InlineProps } from './controls.types'

export function InlineGroup({
  label,
  ...props
}: InlineProps & { label: string }) {
  return <span {...props} role="group" aria-label={label} />
}
