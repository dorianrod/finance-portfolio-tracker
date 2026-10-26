export function accountsForType(
  type: string,
  allAccounts: string[],
  accountToType: Record<string, string>,
): string[] {
  return allAccounts.filter((account) => accountToType[account] === type)
}
