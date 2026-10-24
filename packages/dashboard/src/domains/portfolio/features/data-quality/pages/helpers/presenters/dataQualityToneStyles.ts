import type { QualityTone } from '@/domains/portfolio/shared/types/dataQuality.type'

export const TONE_STYLES: Record<QualityTone, { dot: string; accent: string }> = {
  healthy: {
    dot: 'bg-positive',
    accent: 'bg-positive',
  },
  warning: {
    dot: 'bg-warning',
    accent: 'bg-warning',
  },
  critical: {
    dot: 'bg-danger',
    accent: 'bg-danger',
  },
  unavailable: {
    dot: 'bg-content-subtle',
    accent: 'bg-content-subtle',
  },
}
