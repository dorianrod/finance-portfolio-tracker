export function accountTypeSelectionState(
  accounts: string[],
  selected: Set<string>,
) {
  const selectedCount = accounts.filter((account) =>
    selected.has(account),
  ).length
  const allSelected = accounts.length > 0 && selectedCount === accounts.length
  return {
    allSelected,
    partiallySelected: selectedCount > 0 && !allSelected,
    selectedCount,
  }
}
