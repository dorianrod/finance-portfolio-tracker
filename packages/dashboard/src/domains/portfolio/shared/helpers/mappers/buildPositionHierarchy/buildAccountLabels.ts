export function buildAccountLabels(
  accountRows: { account: string; label: string }[],
): Record<string, string> {
  const labels: Record<string, string> = {}
  for (const r of accountRows) {
    if (r.account && r.label) labels[r.account] = r.label
  }
  return labels
}
