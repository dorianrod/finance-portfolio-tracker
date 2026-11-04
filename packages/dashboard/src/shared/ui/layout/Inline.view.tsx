import type { LayoutProps, LayoutTag } from './layout.types'
import { Layout } from './Layout.view'

export function Inline<T extends LayoutTag = 'span'>(props: LayoutProps<T>) {
  return <Layout as="span" gap="default" align="center" flow="row" {...props} />
}
