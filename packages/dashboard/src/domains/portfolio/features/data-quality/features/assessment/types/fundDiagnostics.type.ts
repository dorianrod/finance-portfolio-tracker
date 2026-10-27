import type { FundCoverageReport } from './fundCoverageReport.type'
import type { FundSnapshot } from './fundSnapshot.type'
import type { FundUnresolved } from './fundUnresolved.type'

export type FundDiagnostics = {
  report: FundCoverageReport | null
  snapshots: FundSnapshot[]
  unresolved: FundUnresolved[]
}
