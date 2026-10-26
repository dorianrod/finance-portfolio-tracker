import type { InlineProps } from './controls.types'

export function NamedSymbol({
  label,
  ...props
}: InlineProps & { label: string }) {
  return <span {...props} role="img" aria-label={label} />
}
