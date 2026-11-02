import type { AccountTreeProps } from '@/domains/portfolio/features/scope-selection/components/accountTreeSelect/accountTreeSelect.types'
import { accountsForType } from '@/domains/portfolio/features/scope-selection/helpers/transformers/accountTreeSelection/accountsForType'
import { accountTypeSelectionState } from '@/domains/portfolio/features/scope-selection/helpers/transformers/accountTreeSelection/accountTypeSelectionState'
import { toggleAccountTypeSelection } from '@/domains/portfolio/features/scope-selection/helpers/transformers/accountTreeSelection/toggleAccountTypeSelection'
import { toggle } from '@/domains/portfolio/features/scope-selection/helpers/transformers/toggle'
import { useFormatAccountLabel } from '@/domains/portfolio/shared/helpers/formatters/useFormatAccountLabel'
import i18n from '@/i18n/i18n'
import { useFormatNumber } from '@/shared/helpers/formatters/useFormatNumber'
import { Checkbox } from '@/shared/ui/Checkbox.view'
import { Button } from '@/shared/ui/controls/Button.view'
import { ChoiceRow } from '@/shared/ui/formElements/ChoiceRow.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import { AccountSelectionRows } from './AccountSelectionRows.view'

export function AccountTree({
  allAccountTypes,
  accountToType,
  allAccounts,
  accountLabels,
  selected,
  onChange,
}: AccountTreeProps) {
  const accountGroups = allAccountTypes.map((type) => ({
    accounts: accountsForType(type, allAccounts, accountToType),
    type,
  }))
  return (
    <Layout overflow="clip">
      <Surface variant="selectionPanel">
        <Layout as="span" flow="control" width="full">
          <Button
            type="button"
            onClick={() => onChange(new Set())}
            variant="sectionChoice"
            selected={selected.size === 0}
          >
            <Text variant="medium">
              {i18n.t('ui.accounttreeselect.allAccounts')}
            </Text>
            {selected.size === 0 && (
              <Text variant="captionStrong" tone="accent">
                {i18n.t('ui.accounttreeselect.selected')}
              </Text>
            )}
          </Button>
        </Layout>

        <Surface variant="sectionStart">
          {accountGroups.map((group) => (
            <TreeAccountType
              key={group.type}
              accountLabels={accountLabels}
              accounts={group.accounts}
              onChange={onChange}
              selected={selected}
              type={group.type}
            />
          ))}
        </Surface>
      </Surface>
    </Layout>
  )
}

function TreeAccountType({
  accountLabels,
  accounts,
  onChange,
  selected,
  type,
}: {
  accountLabels: Record<string, string>
  accounts: string[]
  onChange: (next: Set<string>) => void
  selected: Set<string>
  type: string
}) {
  const formatNumber = useFormatNumber()
  const formatAccountLabel = useFormatAccountLabel()
  const rows = accounts.map((account) => ({
    account,
    label: formatAccountLabel(account, { labels: accountLabels }),
    checked: selected.has(account),
  }))
  const handleToggle = (account: string) => onChange(toggle(selected, account))
  if (accounts.length === 0) return null
  const { allSelected, partiallySelected, selectedCount } =
    accountTypeSelectionState(accounts, selected)
  return (
    <Inset inset="compact">
      <ChoiceRow variant="nested">
        <Inline as="span" align="center" gap="default" inset="compact">
          <Checkbox
            checked={allSelected}
            indeterminate={partiallySelected}
            onChange={() =>
              onChange(toggleAccountTypeSelection(accounts, selected))
            }
          />
          <Text variant="captionSectionLabel" tone="muted">
            {type}
          </Text>
          {selectedCount > 0 && (
            <Layout as="span" flow="inline" placement="trailing">
              <Text variant="micro" tone="subtle" numeric>
                {i18n.t('ui.accounttreeselect.selectedCount', {
                  selected: formatNumber(selectedCount),
                  total: formatNumber(accounts.length),
                })}
              </Text>
            </Layout>
          )}
        </Inline>
      </ChoiceRow>
      <AccountSelectionRows
        rows={rows}
        onToggle={handleToggle}
        variant="tree"
      />
    </Inset>
  )
}
