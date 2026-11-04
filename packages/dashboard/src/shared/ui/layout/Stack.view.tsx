import type { LayoutProps, LayoutTag } from './layout.types'
import { Layout } from './Layout.view'

export function Stack<T extends LayoutTag = 'div'>(props: LayoutProps<T>) {
  return <Layout gap="relaxed" flow="column" {...props} />
}
