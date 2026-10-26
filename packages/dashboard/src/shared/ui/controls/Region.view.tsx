import type { ContentProps } from './controls.types'

export function Region({ label, ...props }: ContentProps & { label: string }) {
  return <section {...props} aria-label={label} />
}
