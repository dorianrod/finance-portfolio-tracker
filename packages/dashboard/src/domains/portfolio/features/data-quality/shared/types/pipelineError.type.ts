export type PipelineError = {
  source: string
  level: 'error' | 'warning'
  type: string
  // File-level validation errors may not concern a dated row.
  date: Date | null
  account: string
  isin: string
  ticker: string
  name: string
  message: string
}
