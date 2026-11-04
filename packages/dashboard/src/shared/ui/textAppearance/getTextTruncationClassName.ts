export function getTextTruncationClassName(
  as: string | undefined,
  truncate: boolean | undefined,
) {
  if (!truncate) return ''
  return as === 'td' || as === 'th' ? 'truncate' : 'truncate block'
}
