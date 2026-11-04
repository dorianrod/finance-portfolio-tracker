export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message?: string) {
    super(message || `HTTP ${status}`)
    this.status = status
    this.name = 'HttpError'
  }
}
