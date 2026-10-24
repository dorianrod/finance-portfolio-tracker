export type PipelineError = {
  source: string
  level: 'error' | 'warning'
  type: string
  date: string
  account: string
  isin: string
  ticker: string
  name: string
  message: string
}
