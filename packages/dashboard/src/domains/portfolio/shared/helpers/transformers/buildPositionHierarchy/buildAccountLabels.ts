export function buildAccountLabels(
  accountRows: { account: string; label: string }[],
): Record<string, string> {
  return Object.fromEntries(
    accountRows
      .filter((row) => row.account && row.label)
      .map((row) => [row.account, row.label]),
  )
}
