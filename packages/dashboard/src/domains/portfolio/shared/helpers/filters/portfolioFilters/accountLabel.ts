export function accountLabel(
  account: string,
  labels: Record<string, string>,
): string {
  if (labels[account]) return labels[account]
  return account.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
