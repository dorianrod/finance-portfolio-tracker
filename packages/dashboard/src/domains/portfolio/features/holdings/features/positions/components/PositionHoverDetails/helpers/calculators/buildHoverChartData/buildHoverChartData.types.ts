export type HoverChartDataPoint = {
  // Calendar-month key used to align monthly price and operation series.
  date: string
  Value: number
  'Cost basis': number
  'Unit price': number
  hasBuy: boolean
  hasSell: boolean
  buyAmount?: number
  sellAmount?: number
  sellGain?: number
  unrealized: number
  rollingReturns: RollingReturn[]
}

export type RollingReturn = {
  label: string
  pct: number
}
