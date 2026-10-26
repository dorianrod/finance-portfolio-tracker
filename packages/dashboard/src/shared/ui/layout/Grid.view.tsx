import type { LayoutProps, LayoutTag } from './layout.types'
import { Layout } from './Layout.view'

export function Grid<T extends LayoutTag = 'div'>(props: LayoutProps<T>) {
  return (
    <Layout
      gap="relaxed"
      flow="grid"
      {...props}
      columns={props.arrangement ? undefined : (props.columns ?? 2)}
    />
  )
}
