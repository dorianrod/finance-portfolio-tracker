export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError && NETWORK_ERROR_SIGNATURES.has(error.message)
  )
}

const NETWORK_ERROR_SIGNATURES = new Set([
  'Failed to fetch',
  'fetch failed',
  'NetworkError when attempting to fetch resource.',
  'Load failed',
])
