import { describe, expect, it, vi } from 'vitest'
import { requestAssetIrr } from './useAssetIrr'

const payload = {
  available: true,
  start_date: '2026-06-30',
  end_date: '2026-10-13',
  assets: [{
    key: 'name:natixis pee',
    label: 'Natixis PEE',
    name: 'Natixis PEE',
    irr: 6.5604,
    value: 112433,
    accounts: ['Natixis PEE'],
    account_types: ['PEE'],
  }],
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
      ['Natixis PEE'],
      ['PEE'],
      '2026-06-30',
      '2026-10-13',
      new AbortController().signal,
      fetchMock as unknown as typeof fetch,
    )

    expect(result).toEqual(payload)
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      accounts: ['Natixis PEE'],
      account_types: ['PEE'],
      date_from: '2026-06-30',
      date_to: '2026-10-13',
    })
  })

  it('surfaces an API calculation error', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ error: 'Unable to calculate asset IRR' }, 500)) as unknown as typeof fetch

    await expect(requestAssetIrr(
      [],
      [],
      undefined,
      '2026-10-13',
      new AbortController().signal,
      fetchImpl,
    )).rejects.toThrow('Unable to calculate asset IRR')
  })
})
