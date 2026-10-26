import { rawAccountId } from '@/domains/portfolio/shared/helpers/filters/accountFilter/rawAccountId'

export function buildDemoPresetSelection(
  allAccounts: string[],
  demoPresetAccounts?: string[] | null,
): Set<string> | null {
  if (!demoPresetAccounts) return null
  const included = new Set(demoPresetAccounts)
  return new Set(
    allAccounts.filter((account) => included.has(rawAccountId(account))),
  )
}
