export function gainClass(v: number | null | undefined): string {
  if (v == null) return 'text-gray-400'
  return v >= 0 ? 'text-emerald-400' : 'text-red-400'
}
