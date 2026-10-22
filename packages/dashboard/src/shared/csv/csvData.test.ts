import Papa from 'papaparse'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearCsvCache, parseCsv } from './csvData'

vi.mock('papaparse', () => ({
  default: { parse: vi.fn() },
}))

interface CsvRow {
  id: string
}

const result = (data: CsvRow[]): Papa.ParseResult<CsvRow> => ({
  data,
  errors: [],
  meta: {
    aborted: false,
    cursor: 0,
    delimiter: ',',
    fields: ['id'],
    linebreak: '\n',
    truncated: false,
  },
})

const parseMock = vi.mocked(Papa.parse as (
  source: string,
  config: Papa.ParseRemoteConfig<CsvRow>,
) => void)

describe('parseCsv', () => {
  beforeEach(() => {
    clearCsvCache()
    parseMock.mockReset()
  })

  it('shares one request and result for the same URL', async () => {
    const rows = [{ id: 'position-1' }]
    parseMock.mockImplementation((source, config) => {
      config.complete?.(result(rows), source)
    })

    const firstRequest = parseCsv<CsvRow>('/data/positions.csv')
    const secondRequest = parseCsv<CsvRow>('/data/positions.csv')

    expect(firstRequest).toBe(secondRequest)
    await expect(firstRequest).resolves.toBe(rows)
    expect(Papa.parse).toHaveBeenCalledOnce()
  })

  it('uses the resource URL as the cache key', async () => {
    parseMock.mockImplementation((source, config) => {
      config.complete?.(result([{ id: source }]), source)
    })

    await Promise.all([
      parseCsv<CsvRow>('/data/positions.csv'),
      parseCsv<CsvRow>('/data/operations.csv'),
    ])

    expect(Papa.parse).toHaveBeenCalledTimes(2)
  })

  it('evicts a failed request so the resource can be retried', async () => {
    const rows = [{ id: 'position-1' }]
    parseMock
      .mockImplementationOnce((source, config) => {
        config.error?.(new Error('Network error'), source)
      })
      .mockImplementationOnce((source, config) => {
        config.complete?.(result(rows), source)
      })

    await expect(parseCsv<CsvRow>('/data/positions.csv')).rejects.toThrow('Network error')
    await expect(parseCsv<CsvRow>('/data/positions.csv')).resolves.toBe(rows)
    expect(Papa.parse).toHaveBeenCalledTimes(2)
  })
})
