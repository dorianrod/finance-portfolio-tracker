import { csvRequests } from './csvRequests'

export function clearCsvCache(): void {
  csvRequests.clear()
}
