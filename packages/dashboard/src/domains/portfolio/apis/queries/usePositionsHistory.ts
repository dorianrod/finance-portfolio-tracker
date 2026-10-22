import { PORTFOLIO_ENDPOINTS } from '@/domains/portfolio/apis/endpoints'
import { useSyncExternalStore } from 'react'
import { parseCsv } from '@/shared/csv/csvData'
import { buildPositionsHistory, type HistoryMap, type HistoryPoint } from '@/domains/portfolio/helpers/positionsHistory.logic'
import { RAW_POSITION_SCHEMA } from '@/domains/portfolio/apis/schemas/portfolioCsvSchemas'

export type { HistoryPoint }

let cache: HistoryMap | null = null
let loading = false
const listeners = new Set<() => void>()

function load() {
  if (cache || loading) return
  loading = true
  parseCsv(PORTFOLIO_ENDPOINTS.data.positions, RAW_POSITION_SCHEMA)
    .then((data) => {
      cache = buildPositionsHistory(data)
      loading = false
      listeners.forEach((fn) => fn())
    })
    .catch(() => {
      loading = false
    })
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange)
  load()
  return () => listeners.delete(onStoreChange)
}

function getSnapshot(): HistoryMap | null {
  return cache
}

export function usePositionsHistory(isin: string | null): HistoryPoint[] | null {
  const data = useSyncExternalStore(subscribe, getSnapshot)

  if (!data || !isin) return null
  return data.get(isin) ?? null
}
