// eslint-disable-next-line local/shared-feature-usage -- This account-scope protocol keeps the same filtered history for overview comparisons, wealth and performance. See SHARED_OWNERSHIP_AUDIT.md.
import { rawAccountId } from '@/domains/portfolio/shared/helpers/filters/accountFilter/rawAccountId'

export function normalizeAccountSelection(
  accounts: Iterable<string>,
): string[] {
  return [...new Set([...accounts].map(rawAccountId))].toSorted()
}
