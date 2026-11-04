export type SecurityExposure = {
  id: string
  name: string
  value: number
  funds: string[]
  /** Value contributed by each source fund, largest first. */
  sources: ExposureSource[]
}

export type IssuerExposure = {
  id: string
  name: string
  value: number
  weight: number
  securities: SecurityExposure[]
  funds: string[]
  /** Value contributed by each source fund, largest first. */
  sources: ExposureSource[]
}

export type ExposureSource = {
  // Direct holdings have no source fund; their label is resolved at display time.
  fund: string | null
  value: number
}
