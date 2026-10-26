export type SecurityExposure = {
  id: string
  name: string
  value: number
  funds: string[]
  /** Value contributed by each source fund, largest first. */
  sources: { fund: string; value: number }[]
}

export type IssuerExposure = {
  id: string
  name: string
  value: number
  weight: number
  securities: SecurityExposure[]
  funds: string[]
  /** Value contributed by each source fund, largest first. */
  sources: { fund: string; value: number }[]
}
