import { useSyncExternalStore } from 'react'
import Papa from 'papaparse'
import { dataUrl } from '@/shared/csv/csvData'
import { buildPositionsHistory, type RawPositionsHistoryRow, type HistoryMap, type HistoryPoint } from '@/logic/positionsHistory.logic'

export type { HistoryPoint }

let cache: HistoryMap | null = null
let loading = false
const listeners = new Set<() => void>()

function load() {
  if (cache || loading) return
  loading = true
  Papa.parse<RawPositionsHistoryRow>(dataUrl('positions.csv'), {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: ({ data }) => {
      cache = buildPositionsHistory(data)
      loading = false
      listeners.forEach((fn) => fn())
    },
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
