import { describe, expect, it, vi } from 'vitest'

import { requestAssetIrr } from '@/domains/portfolio/features/performance/apis/queries/useGetAssetIrrQuery/requestAssetIrr'

const payload = {
  available: true,
  start_date: '2026-06-30',
  end_date: '2026-10-13',
  assets: [
    {
      key: 'name:example employee savings',
      label: 'Example Employee Savings',
      name: 'Example Employee Savings',
      irr: 6.5604,
      value: 112433,
      accounts: ['Example Employee Savings'],
      account_types: ['PEE'],
    },
  ],
}

function jsonResponse(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('requestAssetIrr', () => {
  it.each([
    { start: new Date(NaN), end: new Date('2026-10-13') },
    { start: undefined, end: new Date(NaN) },
    { start: new Date('2026-10-14'), end: new Date('2026-10-13') },
  ])(
    'rejects invalid dates before sending a request: $start to $end',
    async ({ start, end }) => {
      const fetchMock = vi.fn<typeof fetch>()
      await expect(
        requestAssetIrr(
          [],
          [],
          start,
          end,
          new AbortController().signal,
          fetchMock,
        ),
      ).rejects.toMatchObject({ name: 'ValidationError' })
      expect(fetchMock).not.toHaveBeenCalled()
    },
  )

  it('posts the selected scope and date range to the local pipeline API', async () => {
    const fetchMock = vi.fn<typeof fetch>(
      async (...request: Parameters<typeof fetch>) => {
        void request
        return jsonResponse(payload)
      },
    )

    const result = await requestAssetIrr(
      ['Example Employee Savings'],
      ['PEE'],
      new Date('2026-06-30'),
      new Date('2026-10-13'),
      new AbortController().signal,
      fetchMock,
    )

    expect(result).toEqual({
      ...payload,
      start_date: new Date(payload.start_date),
      end_date: new Date(payload.end_date),
    })
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(
      JSON.parse(await new Response(fetchMock.mock.calls[0][1]?.body).text()),
    ).toEqual({
      accounts: ['Example Employee Savings'],
      account_types: ['PEE'],
      date_from: '2026-06-30',
      date_to: '2026-10-13',
    })
  })

  it('surfaces an API calculation error', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse({ error: 'Unable to calculate asset IRR' }, 500),
    )

    await expect(
      requestAssetIrr(
        [],
        [],
        undefined,
        new Date('2026-10-13'),
        new AbortController().signal,
        fetchImpl,
      ),
    ).rejects.toThrow('Unable to calculate asset IRR')
  })

  it.each(['not-a-number', 'Infinity', '-Infinity'])(
    'rejects the invalid IRR %s',
    async (irr) => {
      const fetchImpl = vi.fn<typeof fetch>(async () =>
        jsonResponse({
          ...payload,
          assets: [{ ...payload.assets[0], irr }],
        }),
      )

      await expect(
        requestAssetIrr(
          [],
          [],
          undefined,
          new Date('2026-10-13'),
          new AbortController().signal,
          fetchImpl,
        ),
      ).rejects.toThrow()
    },
  )

  it('defaults null response arrays and display strings', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse({
        ...payload,
        assets: [
          {
            ...payload.assets[0],
            name: null,
            label: null,
            accounts: null,
            account_types: null,
          },
        ],
      }),
    )
    const result = await requestAssetIrr(
      [],
      [],
      undefined,
      new Date('2026-10-13'),
      new AbortController().signal,
      fetchImpl,
    )
    expect(result.assets).toEqual([
      {
        ...payload.assets[0],
        name: '',
        label: '',
        accounts: [],
        account_types: [],
      },
    ])
  })

  it('accepts an unavailable response with a null asset list', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      jsonResponse({ available: false, assets: null }),
    )
    await expect(
      requestAssetIrr(
        [],
        [],
        undefined,
        new Date('2026-10-13'),
        new AbortController().signal,
        fetchImpl,
      ),
    ).resolves.toEqual({
      available: false,
      start_date: null,
      end_date: null,
      assets: [],
    })
  })
})
