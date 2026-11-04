export type RequestErrorCode =
  | 'invalid-data'
  | 'missing-data'
  | 'access-denied'
  | 'unexpected'
  | 'network'
  | 'timeout'

export type RequestError =
  | { kind: 'known'; code: RequestErrorCode }
  | { kind: 'http'; status: number }
  | { kind: 'message'; message: string }
