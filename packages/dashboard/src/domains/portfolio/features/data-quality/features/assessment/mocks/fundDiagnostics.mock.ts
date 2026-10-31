import type { FundDiagnostics } from '@/domains/portfolio/features/data-quality/features/assessment/types/fundDiagnostics.type'

export function makeFundDiagnostics(
  overrides: Partial<FundDiagnostics> = {},
): FundDiagnostics {
  return { report: null, snapshots: [], unresolved: [], ...overrides }
}
