// eslint-disable-next-line local/review-shared-feature-sharing -- reviewed: 2026-10-27; Account labels and identities feed scope selection and the scope badges used by performance, wealth and quality. See SHARED_OWNERSHIP_AUDIT.md.
export function buildAccountLabels(
  accountRows: { account: string; label: string }[],
): Record<string, string> {
  return Object.fromEntries(
    accountRows
      .filter((row) => row.account && row.label)
      .map((row) => [row.account, row.label]),
  )
}
