import Papa from 'papaparse'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearCsvCache, parseCsv } from './csvData'
import * as yup from 'yup'

vi.mock('papaparse', () => ({
  default: { parse: vi.fn() },
}))

interface CsvRow {
  id: string
}

const CSV_ROW_SCHEMA: yup.ObjectSchema<CsvRow> = yup.object({
  id: yup.string().defined(),
})

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

    const firstRequest = parseCsv('/data/positions.csv', CSV_ROW_SCHEMA)
    const secondRequest = parseCsv('/data/positions.csv', CSV_ROW_SCHEMA)

    await expect(Promise.all([firstRequest, secondRequest])).resolves.toEqual([rows, rows])
    expect(Papa.parse).toHaveBeenCalledOnce()
  })

  it('uses the resource URL as the cache key', async () => {
    parseMock.mockImplementation((source, config) => {
      config.complete?.(result([{ id: source }]), source)
    })

    await Promise.all([
      parseCsv('/data/positions.csv', CSV_ROW_SCHEMA),
      parseCsv('/data/operations.csv', CSV_ROW_SCHEMA),
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

    await expect(parseCsv('/data/positions.csv', CSV_ROW_SCHEMA)).rejects.toThrow('Network error')
    await expect(parseCsv('/data/positions.csv', CSV_ROW_SCHEMA)).resolves.toEqual(rows)
    expect(Papa.parse).toHaveBeenCalledTimes(2)
  })

  it('rejects rows that do not match the supplied schema', async () => {
    parseMock.mockImplementation((source, config) => {
      config.complete?.(result([{ id: undefined as never }]), source)
    })

    await expect(parseCsv('/data/positions.csv', CSV_ROW_SCHEMA)).rejects.toThrow()
  })
})
