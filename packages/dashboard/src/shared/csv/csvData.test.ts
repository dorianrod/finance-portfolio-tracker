import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as yup from 'yup'

import { clearCsvCache, parseCsv, parseOptionalCsv } from './csvData'

const CSV_ROW_SCHEMA = yup.object({ id: yup.string().required() })
const csvResponse = (text = 'id\nposition-1\n') =>
  new Response(text, {
    headers: { 'Content-Type': 'text/csv' },
  })

describe('parseCsv', () => {
  beforeEach(clearCsvCache)
  afterEach(() => vi.unstubAllGlobals())

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
