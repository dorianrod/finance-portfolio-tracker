import { afterEach, describe, expect, it, vi } from 'vitest'

import { HISTORICAL_FUND_HOLDING_SCHEMA } from './historicalFundHoldingSchema'

const historyRow = {
  parent_isin: 'FUND-ISIN',
  parent_name: 'Example fund',
  holding_id: 'SECURITY-ISIN',
  holding_name: 'Example security',
  weight: '0.25',
  holdings_date: '2026-09-30',
  effective_date: '2026-10-01',
  history_snapshot_id: 'snapshot-1',
  captured_at: '2026-10-02T12:00:00Z',
}

afterEach(() => vi.unstubAllEnvs())

describe('historicalFundHoldingSchema', () => {
  it('validates both holding fields and history metadata into a domain entity', async () => {
    const holding = await HISTORICAL_FUND_HOLDING_SCHEMA.validate({
      ...historyRow,
      unexpected_column: 'ignored',
    })

    expect(holding).toMatchObject({
      parentIsin: 'FUND-ISIN',
      parentName: 'Example fund',
      holdingId: 'SECURITY-ISIN',
      holdingName: 'Example security',
      issuerId: 'SECURITY-ISIN',
      issuerName: 'Example security',
      weight: 0.25,
      holdingsDate: new Date('2026-09-30'),
      effectiveDate: new Date('2026-10-01'),
      historySnapshotId: 'snapshot-1',
      capturedAt: new Date('2026-10-02T12:00:00Z'),
    })
    expect(holding).not.toHaveProperty('unexpected_column')
    expect(holding).not.toHaveProperty('parent_isin')
  })

  it('skips nested holding and metadata checks while retaining domain mapping in fast mode', () => {
    vi.stubEnv('DEBUG', 'false')
    const holding = HISTORICAL_FUND_HOLDING_SCHEMA.cast({
      ...historyRow,
      holding_id: '',
      history_snapshot_id: '',
    })
    expect(holding).toMatchObject({
      holdingId: '',
      historySnapshotId: '',
      weight: 0.25,
      effectiveDate: new Date('2026-10-01'),
      capturedAt: new Date('2026-10-02T12:00:00Z'),
    })
  })

  it.each([
    ['holding_id', ''],
    ['weight', 'invalid'],
    ['holdings_date', '2026-02-30'],
    ['effective_date', '2026-02-30'],
    ['history_snapshot_id', ''],
    ['captured_at', 'invalid'],
  ])('rejects invalid %s', async (field, value) => {
    await expect(
      HISTORICAL_FUND_HOLDING_SCHEMA.validate({
        ...historyRow,
        [field]: value,
      }),
    ).rejects.toMatchObject({ name: 'ValidationError' })
  })
})
