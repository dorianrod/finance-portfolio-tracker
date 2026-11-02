import { Checkbox } from '@/shared/ui/Checkbox.view'
import { ChoiceRow } from '@/shared/ui/formElements/ChoiceRow.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
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
    <ChoiceRow variant={variant === 'tree' ? 'nested' : undefined}>
      <Inline as="span" align="center" gap="default" inset="default">
        <Checkbox
          checked={row.checked}
          onChange={() => onToggle(row.account)}
        />
        {variant === 'tree' ? (
          <Layout as="span" flow="inline">
            <Text variant="caption" tone="secondary" truncate>
              {row.label}
            </Text>
          </Layout>
        ) : (
          <Text variant="caption" tone="muted">
            {row.label}
          </Text>
        )}
      </Inline>
    </ChoiceRow>
  )
}
