import type { RawIsinRow } from './rawIsinRow.type'

export type RawIsinRows = {
  geo: RawIsinRow[]
  secteur: RawIsinRow[]
  currency: RawIsinRow[]
  classe: RawIsinRow[]
}

export type RawIsinData = RawIsinRows & {
  loading: boolean
}
