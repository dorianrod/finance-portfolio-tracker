// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; This account-scope protocol keeps the same filtered history for overview comparisons, wealth and performance. See SHARED_OWNERSHIP_AUDIT.md.
import { rawAccountId } from '@/domains/portfolio/shared/helpers/transformers/accountFilter/rawAccountId'

export function normalizeAccountSelection(
  accounts: Iterable<string>,
): string[] {
  return [...new Set([...accounts].map(rawAccountId))].toSorted()
}
