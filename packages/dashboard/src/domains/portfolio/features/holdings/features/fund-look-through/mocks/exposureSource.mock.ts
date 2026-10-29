import type { ExposureSource } from '@/domains/portfolio/features/holdings/features/fund-look-through/types/issuerExposure.type'

export function exposureSource(overrides: Partial<ExposureSource> = {}): ExposureSource {
  return { fund: 'Example fund', value: 100, ...overrides }
}
