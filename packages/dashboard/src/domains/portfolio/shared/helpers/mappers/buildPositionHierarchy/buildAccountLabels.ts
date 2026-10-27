// eslint-disable-next-line local/review-shared-feature-sharing -- Account labels and identities feed scope selection and the scope badges used by performance, wealth and quality. See SHARED_OWNERSHIP_AUDIT.md.
export function buildAccountLabels(
  accountRows: { account: string; label: string }[],
): Record<string, string> {
  const labels: Record<string, string> = {}
  for (const r of accountRows) {
    if (r.account && r.label) labels[r.account] = r.label
  }
  return labels
}
