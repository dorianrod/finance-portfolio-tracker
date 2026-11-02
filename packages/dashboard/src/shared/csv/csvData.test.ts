import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as yup from 'yup'

import { clearCsvCache } from '@/shared/csv/csvData/clearCsvCache'
import { parseCsv } from '@/shared/csv/csvData/parseCsv'
import { parseOptionalCsv } from '@/shared/csv/csvData/parseOptionalCsv'

const CSV_ROW_SCHEMA = yup.object({ id: yup.string().required() })
const csvResponse = (text = 'id\nposition-1\n') =>
  new Response(text, {
    headers: { 'Content-Type': 'text/csv' },
  })

describe('parseCsv', () => {
  beforeEach(clearCsvCache)
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('shares one network request for concurrent consumers of the same URL', async () => {
    const fetchMock = vi.fn(async () => csvResponse())
    vi.stubGlobal('fetch', fetchMock)
    const results = await Promise.all([
      parseCsv('/data/positions.csv', CSV_ROW_SCHEMA),
      parseCsv('/data/positions.csv', CSV_ROW_SCHEMA),
    ])
    expect(results).toEqual([[{ id: 'position-1' }], [{ id: 'position-1' }]])
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('caches resources independently', async () => {
    const fetchMock = vi.fn(async () => csvResponse())
    vi.stubGlobal('fetch', fetchMock)
    await Promise.all([
      parseCsv('/data/positions.csv', CSV_ROW_SCHEMA),
      parseCsv('/data/operations.csv', CSV_ROW_SCHEMA),
    ])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('reads fresh data when the query requests the resource again', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(csvResponse())
      .mockResolvedValueOnce(csvResponse('id\nposition-2\n'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      parseCsv('/data/positions.csv', CSV_ROW_SCHEMA),
    ).resolves.toEqual([{ id: 'position-1' }])
    await expect(
      parseCsv('/data/positions.csv', CSV_ROW_SCHEMA),
    ).resolves.toEqual([{ id: 'position-2' }])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it.each([
    ['a network error', () => Promise.reject(new Error('Network error'))],
    [
      'an HTTP failure',
      async () => new Response('unavailable', { status: 503 }),
    ],
    [
      'an HTML fallback',
      async () =>
        new Response('<html></html>', {
          headers: { 'Content-Type': 'text/html' },
        }),
    ],
    ['malformed CSV', async () => csvResponse('id,name\n"unclosed')],
    ['invalid rows', async () => csvResponse('name\nmissing-id')],
  ])('evicts %s so a retry can recover', async (_label, failure) => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockImplementationOnce(failure)
      .mockImplementation(async () => csvResponse())
    vi.stubGlobal('fetch', fetchMock)
    await expect(
      parseCsv('/data/positions.csv', CSV_ROW_SCHEMA),
    ).rejects.toThrow()
    await expect(
      parseCsv('/data/positions.csv', CSV_ROW_SCHEMA),
    ).resolves.toEqual([{ id: 'position-1' }])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('skips checks but preserves row conversion when CSV validation is disabled', async () => {
    vi.stubEnv('DEBUG', 'false')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        csvResponse('id,amount,extra\nposition-1,-2.5,ignored\n'),
      ),
    )
    const schema = yup.object({
      id: yup.string().required(),
      amount: yup.number().positive().required(),
    })

    await expect(parseCsv('/data/positions.csv', schema)).resolves.toEqual([
      { id: 'position-1', amount: -2.5 },
    ])
  })

  it.each(['true', 'false'])(
    'keeps transport errors visible with DEBUG=%s',
    async (setting) => {
      vi.stubEnv('DEBUG', setting)
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response(null, { status: 503 })),
      )
      await expect(
        parseCsv('/data/positions.csv', CSV_ROW_SCHEMA),
      ).rejects.toThrow('HTTP 503')
    },
  )

  it('accepts an absent optional file without hiding other failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 404 })),
    )
    await expect(
      parseOptionalCsv('/missing.csv', CSV_ROW_SCHEMA),
    ).resolves.toEqual([])
  })

  it.each([403, 500])(
    'rejects HTTP %s for an optional file',
    async (status) => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response('', { status })),
      )
      await expect(
        parseOptionalCsv('/broken.csv', CSV_ROW_SCHEMA),
      ).rejects.toThrow(`HTTP ${status}`)
    },
  )
})
