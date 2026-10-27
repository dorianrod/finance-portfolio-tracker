import { type ComponentPropsWithoutRef, createElement } from 'react'

import type { ControlProps } from '@/shared/ui/controlProps'

import { DATA_TABLE_STYLES } from './tableStyles'

export function TablePanel(
  props: ControlProps<ComponentPropsWithoutRef<'section'>>,
) {
  return (
    <section
      {...props}
      className={[DATA_TABLE_STYLES.panel].filter(Boolean).join(' ')}
    />
  )
}
function TableToolbar(props: ControlProps<ComponentPropsWithoutRef<'div'>>) {
  return (
    <div
      {...props}
      className={[DATA_TABLE_STYLES.toolbar].filter(Boolean).join(' ')}
    />
  )
}
function TableTitle(props: ControlProps<ComponentPropsWithoutRef<'h2'>>) {
  return (
    <h2
      {...props}
      className={[DATA_TABLE_STYLES.title].filter(Boolean).join(' ')}
    />
  )
}
function TableDescription(props: ControlProps<ComponentPropsWithoutRef<'p'>>) {
  return (
    <p
      {...props}
      className={[DATA_TABLE_STYLES.description].filter(Boolean).join(' ')}
    />
  )
}
function TableActions(props: ControlProps<ComponentPropsWithoutRef<'div'>>) {
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
}: ControlProps<ComponentPropsWithoutRef<'thead'>> & {
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
