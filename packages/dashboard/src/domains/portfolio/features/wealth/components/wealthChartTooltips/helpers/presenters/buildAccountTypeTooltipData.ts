export function buildAccountTypeTooltipData(
  row: Record<string, number | string | Date> | undefined,
  accountTypes: string[],
) {
  const values = accountTypes.map((accountType, index) => {
    const value = row?.[accountType]
    return { accountType, index, value: typeof value === 'number' ? value : 0 }
  })
  const total = values.reduce((sum, item) => sum + item.value, 0)
  return {
    total,
    rows: values.map((item) => ({
      ...item,
      share: total > 0 ? (item.value / total) * 100 : null,
    })),
  }
}
