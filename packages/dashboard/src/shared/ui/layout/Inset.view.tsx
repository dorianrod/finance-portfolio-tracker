import type { LayoutProps, LayoutTag } from './layout.types'
import { Layout } from './Layout.view'

export function Inset<T extends LayoutTag = 'div'>(props: LayoutProps<T>) {
  return <Layout inset="default" {...props} />
}
