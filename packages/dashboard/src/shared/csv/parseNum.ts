export function parseNum(v: string): number | null {
  if (!v || v.trim() === '') return null
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}
