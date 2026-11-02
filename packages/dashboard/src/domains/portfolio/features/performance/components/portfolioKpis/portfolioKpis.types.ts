import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'

export type IrrKpiProps = {
  // Missing or insufficient cash flows may not define a return.
  value: number | null
  status?: IrrStatus
  accountFilters?: ReadonlySet<string>
}
