import type { ExposureSource } from '@/domains/portfolio/features/holdings/features/fund-look-through/types/issuerExposure.type'

export function buildExposureSourceRows(sources: ExposureSource[]) {
  return sources.map((source) => ({
    key: JSON.stringify(source.fund),
    source,
  }))
}
