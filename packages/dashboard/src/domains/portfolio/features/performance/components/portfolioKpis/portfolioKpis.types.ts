import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'

export type IrrKpiProps = {
  value: number | null
  status?: IrrStatus
  scopeLabel?: string
}
