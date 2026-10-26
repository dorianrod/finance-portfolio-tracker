export type PipelineError = {
  source: string
  level: 'error' | 'warning'
  type: string
  date: Date | null
  account: string
  isin: string
  ticker: string
  name: string
  message: string
}
