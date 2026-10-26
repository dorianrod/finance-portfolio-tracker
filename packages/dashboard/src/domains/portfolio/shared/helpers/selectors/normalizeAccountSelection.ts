import { rawAccountId } from '@/domains/portfolio/shared/helpers/filters/accountFilter/rawAccountId'

export function normalizeAccountSelection(
  accounts: Iterable<string>,
): string[] {
  return [...new Set([...accounts].map(rawAccountId))].toSorted()
}
