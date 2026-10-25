import { describe, expect, it, vi } from 'vitest'

import { requestAssetIrr } from './useAssetIrrQuery'

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
  it('posts the selected scope and date range to the local pipeline API', async () => {
    const fetchMock = vi.fn(async (...request: Parameters<typeof fetch>) => {
      void request
      return jsonResponse(payload)
    })

    const result = await requestAssetIrr(
      ['Example Employee Savings'],
      ['PEE'],
      new Date('2026-06-30'),
      new Date('2026-10-13'),
      new AbortController().signal,
      fetchMock as unknown as typeof fetch,
    )

    expect(result).toEqual({
      ...payload,
      start_date: new Date(payload.start_date),
      end_date: new Date(payload.end_date),
    })
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      accounts: ['Example Employee Savings'],
      account_types: ['PEE'],
      date_from: '2026-06-30',
      date_to: '2026-10-13',
    })
  })

  it('surfaces an API calculation error', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ error: 'Unable to calculate asset IRR' }, 500),
    ) as unknown as typeof fetch

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
      const fetchImpl = vi.fn(async () =>
        jsonResponse({
          ...payload,
          assets: [{ ...payload.assets[0], irr }],
        }),
      ) as unknown as typeof fetch

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
