import { getOwnValue } from '@/shared/helpers/transformers/getOwnValue'
export function accountsForType(
  type: string,
  allAccounts: string[],
  accountToType: Record<string, string>,
): string[] {
  return allAccounts.filter(
    (account) => getOwnValue(accountToType, account) === type,
  )
}
