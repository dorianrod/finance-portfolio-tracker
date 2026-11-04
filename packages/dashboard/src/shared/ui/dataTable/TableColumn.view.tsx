export function TableColumn({
  kind = 'value',
}: {
  kind?: keyof typeof COLUMN_WIDTHS
}) {
  return <col style={{ width: COLUMN_WIDTHS[kind] }} />
}

const COLUMN_WIDTHS = {
  expander: '28px',
  label: '27%',
  value: '9%',
  compact: '8%',
  description: '40%',
} as const
