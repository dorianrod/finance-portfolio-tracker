import { rawAccountId } from '@/domains/portfolio/shared/helpers/filters/accountFilter'

export function normalizeAccountSelection(
  accounts: Iterable<string>,
): string[] {
  return [...new Set([...accounts].map(rawAccountId))].toSorted()
}
