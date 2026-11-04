import { Checkbox } from '@/shared/ui/Checkbox.view'
import { ChoiceRow } from '@/shared/ui/formElements/ChoiceRow.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Text } from '@/shared/ui/Text.view'

export function AccountSelectionRows({
  rows,
  onToggle,
  variant,
}: {
  rows: AccountSelectionRow[]
  onToggle: (account: string) => void
  variant: 'tree' | 'select'
}) {
  return (
    <>
      {rows.map((row) => (
        <AccountRow
          key={row.account}
          row={row}
          onToggle={onToggle}
          variant={variant}
        />
      ))}
    </>
  )
}

type AccountSelectionRow = { account: string; label: string; checked: boolean }

function AccountRow({
  row,
  onToggle,
  variant,
}: {
  row: AccountSelectionRow
  onToggle: (account: string) => void
  variant: 'tree' | 'select'
}) {
  return (
    <ChoiceRow variant={variant === 'tree' ? 'treeItem' : 'selectItem'}>
      <Checkbox checked={row.checked} onChange={() => onToggle(row.account)} />
      {variant === 'tree' ? (
        <Layout as="span" flow="inline" sizing="flexible">
          <Text variant="caption" tone="secondary" truncate>
            {row.label}
          </Text>
        </Layout>
      ) : (
        <Text variant="caption" tone="muted">
          {row.label}
        </Text>
      )}
    </ChoiceRow>
  )
}
