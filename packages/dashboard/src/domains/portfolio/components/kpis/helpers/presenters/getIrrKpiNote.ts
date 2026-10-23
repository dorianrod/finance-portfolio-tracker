import type { IrrStatus } from '@/domains/portfolio/types/history'

export function getIrrKpiNote(status: IrrStatus): string | undefined {
  if (status === 'error') return 'Filtered IRR unavailable'
  return undefined
}
