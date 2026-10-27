// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; This account-scope protocol keeps the same filtered history for overview comparisons, wealth and performance. See SHARED_OWNERSHIP_AUDIT.md.
export function sameAccounts(left: string[], right: string[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}
