import { accountsForType } from '@/domains/portfolio/shared/helpers/filters/accountTreeSelection/accountsForType'
import { accountTypeSelectionState } from '@/domains/portfolio/shared/helpers/filters/accountTreeSelection/accountTypeSelectionState'
import { toggleAccountTypeSelection } from '@/domains/portfolio/shared/helpers/filters/accountTreeSelection/toggleAccountTypeSelection'
import { accountLabel } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/accountLabel'
import { toggle } from '@/domains/portfolio/shared/helpers/filters/portfolioFilters/toggle'
import i18n from '@/i18n/i18n'
import { Checkbox } from '@/shared/ui/Checkbox.view'
import { Button } from '@/shared/ui/controls/Button.view'
import { ChoiceRow } from '@/shared/ui/formElements/ChoiceRow.view'
import { Inline } from '@/shared/ui/layout/Inline.view'
import { Inset } from '@/shared/ui/layout/Inset.view'
import { Layout } from '@/shared/ui/layout/Layout.view'
import { Surface } from '@/shared/ui/Surface.view'
import { Text } from '@/shared/ui/Text.view'

import type { AccountTreeProps } from './accountTreeSelect.types'

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

function TreeAccountRow({
  account,
  accountLabels,
  onChange,
  selected,
}: {
  account: string
  accountLabels: Record<string, string>
  onChange: (next: Set<string>) => void
  selected: Set<string>
}) {
  return (
    <ChoiceRow variant="nested">
      <Inline as="span" align="center" gap="default" inset="default">
        <Checkbox
          checked={selected.has(account)}
          onChange={() => onChange(toggle(selected, account))}
        />
        <Layout as="span" flow="inline">
          <Text variant="caption" tone="secondary" truncate>
            {accountLabel(account, accountLabels)}
          </Text>
        </Layout>
      </Inline>
    </ChoiceRow>
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
                {selectedCount}/{accounts.length}
              </Text>
            </Layout>
          )}
        </Inline>
      </ChoiceRow>
      {accounts.map((account) => (
        <TreeAccountRow
          key={account}
          account={account}
          // eslint-disable-next-line local/no-prop-drilling -- Account rows are direct children of their owning account-type group.
          accountLabels={accountLabels}
          // eslint-disable-next-line local/no-prop-drilling -- Account rows are direct children of their owning account-type group.
          onChange={onChange}
          // eslint-disable-next-line local/no-prop-drilling -- Account rows are direct children of their owning account-type group.
          selected={selected}
        />
      ))}
    </Inset>
  )
}
