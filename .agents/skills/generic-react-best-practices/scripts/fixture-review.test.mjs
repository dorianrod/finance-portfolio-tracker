import { describe, expect, it } from 'vitest'

import { reviewFixtureCandidates } from './fixture-review.mjs'

function inputs() {
  const sha256 = 'a'.repeat(64)
  const analysis = {
    typescript: '6.0.3',
    collectorSha256: sha256,
    reviewerSha256: sha256,
    compilerOptionsSha256: sha256,
    sourceSha256: sha256,
    lockfileSha256: null,
  }
  const row = { file: 'src/parcel.test.ts', line: 2, column: 5 }
  const inventory = {
    source: 'src',
    project: 'browser.json',
    analysis,
    testFiles: [{ file: row.file, sha256 }],
    candidates: [row],
  }
  const ledger = {
    schemaVersion: 1,
    source: 'src',
    project: 'browser.json',
    analysis: { ...analysis },
    reviews: [
      {
        ...row,
        sha256,
        decision: 'keep',
        reason: 'Explicit transport input for the schema rejection case.',
      },
    ],
  }
  return { inventory, ledger }
}

describe('fixture review closure', () => {
  it('accepts explicit fresh semantic decisions', () => {
    const { inventory, ledger } = inputs()
    expect(reviewFixtureCandidates(inventory, ledger)).toMatchObject({
      status: 'reviewed',
      reviewed: 1,
      pending: [],
      stale: [],
    })
  })

  it('rejects an added candidate even when the accepted count is unchanged', () => {
    const { inventory, ledger } = inputs()
    inventory.candidates.push({ file: 'src/new.test.ts', line: 1, column: 1 })
    expect(reviewFixtureCandidates(inventory, ledger)).toMatchObject({
      status: 'pending',
      pending: [{ file: 'src/new.test.ts' }],
    })
  })

  it('requires new review when a candidate moves or disappears', () => {
    const { inventory, ledger } = inputs()
    inventory.candidates = []
    expect(reviewFixtureCandidates(inventory, ledger)).toMatchObject({
      status: 'pending',
      stale: [{ reason: 'Review no longer identifies a candidate.' }],
    })
  })

  it('rejects source edits even when the candidate location stays the same', () => {
    const { inventory, ledger } = inputs()
    inventory.testFiles[0].sha256 = 'b'.repeat(64)
    expect(reviewFixtureCandidates(inventory, ledger)).toMatchObject({
      status: 'pending',
      stale: [{ reason: 'Test source changed.' }],
    })
  })

  it.each([
    'typescript',
    'collectorSha256',
    'reviewerSha256',
    'compilerOptionsSha256',
    'sourceSha256',
    'lockfileSha256',
  ])('requires revalidation after a changed %s input', (key) => {
    const { inventory, ledger } = inputs()
    ledger.analysis[key] = key === 'typescript' ? '6.0.4' : 'b'.repeat(64)
    expect(reviewFixtureCandidates(inventory, ledger).status).toBe('pending')
  })

  it.each(['source', 'project'])('rejects a different %s scope', (key) => {
    const { inventory, ledger } = inputs()
    ledger[key] = 'other'
    expect(reviewFixtureCandidates(inventory, ledger).status).toBe('pending')
  })

  it.each([
    (ledger) => {
      ledger.reviews.push({ ...ledger.reviews[0] })
    },
    (ledger) => {
      ledger.reviews[0].reason = ' '
    },
    (ledger) => {
      ledger.reviews[0].decision = 'fix'
    },
    (ledger) => {
      ledger.reviews[0].sha256 = 'stale'
    },
    (ledger) => {
      delete ledger.analysis.sourceSha256
    },
    (ledger) => {
      ledger.schemaVersion = 2
    },
    (ledger) => {
      ledger.analysis.sourceSha256 = 'invalid'
    },
  ])('rejects malformed or duplicate approvals', (change) => {
    const { inventory, ledger } = inputs()
    change(ledger)
    expect(() => reviewFixtureCandidates(inventory, ledger)).toThrow()
  })

  it('allows a genuinely empty inventory with no invented approval', () => {
    const { inventory, ledger } = inputs()
    inventory.candidates = []
    ledger.reviews = []
    expect(reviewFixtureCandidates(inventory, ledger)).toMatchObject({
      status: 'reviewed',
      reviewed: 0,
    })
  })
})
