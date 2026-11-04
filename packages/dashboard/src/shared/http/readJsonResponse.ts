import { HttpError } from './httpError'

export async function readJsonResponse(response: Response): Promise<unknown> {
  if (response.ok) return response.json()
  let message: string | undefined
  try {
    const payload: unknown = await response.json()
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
    )
      message = payload.error
  } catch {
    // A proxy may return an HTML or empty error response. Preserve its HTTP status.
  }
  throw new HttpError(response.status, message)
}
