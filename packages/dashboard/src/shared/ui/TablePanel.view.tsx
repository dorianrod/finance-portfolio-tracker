import { type ComponentPropsWithoutRef, createElement } from 'react'

import { DATA_TABLE_STYLES } from './tableStyles'

export function TablePanel(
  props: Omit<ComponentPropsWithoutRef<'section'>, 'className' | 'style'>,
) {
  return (
    <section
      {...props}
      className={[DATA_TABLE_STYLES.panel].filter(Boolean).join(' ')}
    />
  )
}
function TableToolbar(
  props: Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'style'>,
) {
  return (
    <div
      {...props}
      className={[DATA_TABLE_STYLES.toolbar].filter(Boolean).join(' ')}
    />
  )
}
function TableTitle(
  props: Omit<ComponentPropsWithoutRef<'h2'>, 'className' | 'style'>,
) {
  return (
    <h2
      {...props}
      className={[DATA_TABLE_STYLES.title].filter(Boolean).join(' ')}
    />
  )
}
function TableDescription(
  props: Omit<ComponentPropsWithoutRef<'p'>, 'className' | 'style'>,
) {
  return (
    <p
      {...props}
      className={[DATA_TABLE_STYLES.description].filter(Boolean).join(' ')}
    />
  )
}
function TableActions(
  props: Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'style'>,
) {
  return (
    <div
      {...props}
      className={[DATA_TABLE_STYLES.actions].filter(Boolean).join(' ')}
    />
  )
}
function TableHeader({
  as = 'thead',
  ...props
}: Omit<ComponentPropsWithoutRef<'thead'>, 'className' | 'style'> & {
  as?: 'thead' | 'div'
}) {
  return createElement(as, {
    ...props,
    className: [DATA_TABLE_STYLES.columnHeader].filter(Boolean).join(' '),
  })
}
TablePanel.Toolbar = TableToolbar
TablePanel.Title = TableTitle
TablePanel.Description = TableDescription
TablePanel.Actions = TableActions
TablePanel.Header = TableHeader
