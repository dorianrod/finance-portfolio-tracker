import type { RawIsinData } from '@/domains/portfolio/shared/types/rawIsinData.type'

export function rawData(overrides: Partial<RawIsinData> = {}): RawIsinData {
  return {
    geo: [],
    secteur: [],
    currency: [],
    classe: [],
    loading: false,
    ...overrides,
  }
}
