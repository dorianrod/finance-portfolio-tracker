import { type ComponentPropsWithoutRef, createElement } from 'react'

import { DATA_TABLE_STYLES } from './tableStyles'

export function TablePanel(props: ComponentPropsWithoutRef<'section'>) {
  return (
    <section
      {...props}
      className={[DATA_TABLE_STYLES.panel, props.className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
function TableToolbar(props: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={[DATA_TABLE_STYLES.toolbar, props.className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
function TableTitle(props: ComponentPropsWithoutRef<'h2'>) {
  return (
    <h2
      {...props}
      className={[DATA_TABLE_STYLES.title, props.className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
function TableDescription(props: ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      {...props}
      className={[DATA_TABLE_STYLES.description, props.className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
function TableActions(props: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={[DATA_TABLE_STYLES.actions, props.className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
function TableHeader({
  as = 'thead',
  ...props
}: ComponentPropsWithoutRef<'thead'> & { as?: 'thead' | 'div' }) {
  return createElement(as, {
    ...props,
    className: [DATA_TABLE_STYLES.columnHeader, props.className]
      .filter(Boolean)
      .join(' '),
  })
}
TablePanel.Toolbar = TableToolbar
TablePanel.Title = TableTitle
TablePanel.Description = TableDescription
TablePanel.Actions = TableActions
TablePanel.Header = TableHeader
