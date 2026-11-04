import type { PieEntry } from '@/domains/portfolio/shared/types/pieEntry.type'

export function makePieEntry(overrides: Partial<PieEntry> = {}): PieEntry {
  return { name: 'France', value: 60, total: 100, ...overrides }
}
