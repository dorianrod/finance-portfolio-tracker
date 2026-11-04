import type { IrrStatus } from '@/domains/portfolio/shared/types/statuses.type'

export function resolveAssetIrrStatus(query: {
  isLoading: boolean
  isPlaceholderData: boolean
  isError: boolean
}): IrrStatus {
  if (query.isLoading || query.isPlaceholderData) return 'loading'
  if (query.isError) return 'error'
  return 'ready'
}
