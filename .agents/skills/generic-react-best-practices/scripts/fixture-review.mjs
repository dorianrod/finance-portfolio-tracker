const ANALYSIS_KEYS = [
  'typescript',
  'collectorSha256',
  'reviewerSha256',
  'compilerOptionsSha256',
  'sourceSha256',
  'lockfileSha256',
]

// A keep reason is a semantic decision. This validator verifies its binding
// and completeness; it never manufactures or renews that decision.
export function reviewFixtureCandidates(inventory, ledger) {
  if (
    ledger?.schemaVersion !== 1 ||
    typeof ledger.source !== 'string' ||
    typeof ledger.project !== 'string' ||
    !ledger.analysis ||
    typeof ledger.analysis !== 'object' ||
    ANALYSIS_KEYS.some((key) => {
      const value = ledger.analysis[key]
      if (key === 'typescript')
        return typeof value !== 'string' || !value.trim()
      if (key === 'lockfileSha256' && value === null) return false
      return typeof value !== 'string' || !/^[a-f0-9]{64}$/u.test(value)
    }) ||
    !Array.isArray(ledger.reviews)
  )
    throw new Error('Invalid fixture review ledger.')
  const reviews = new Map()
  for (const row of ledger.reviews) {
    if (
      typeof row?.file !== 'string' ||
      !Number.isInteger(row.line) ||
      row.line < 1 ||
      !Number.isInteger(row.column) ||
      row.column < 1 ||
      !/^[a-f0-9]{64}$/u.test(row.sha256 ?? '') ||
      row.decision !== 'keep' ||
      typeof row.reason !== 'string' ||
      !row.reason.trim()
    )
      throw new Error('Invalid fixture review decision.')
    const key = identity(row)
    if (reviews.has(key)) throw new Error('Duplicate fixture review: ' + key)
    reviews.set(key, row)
  }
  const stale = []
  if (
    ledger.source !== inventory.source ||
    ledger.project !== inventory.project ||
    ANALYSIS_KEYS.some(
      (key) => ledger.analysis[key] !== inventory.analysis[key],
    )
  )
    stale.push({
      reason: 'Analysis inputs changed; review the inventory again.',
    })
  const hashes = new Map(
    inventory.testFiles.map(({ file, sha256 }) => [file, sha256]),
  )
  const pending = []
  let reviewed = 0
  for (const candidate of inventory.candidates) {
    const key = identity(candidate)
    const review = reviews.get(key)
    if (!review)
      pending.push({
        file: candidate.file,
        line: candidate.line,
        column: candidate.column,
      })
    else if (review.sha256 !== hashes.get(candidate.file))
      stale.push({
        file: candidate.file,
        line: candidate.line,
        column: candidate.column,
        reason: 'Test source changed.',
      })
    else reviewed++
    reviews.delete(key)
  }
  for (const review of reviews.values())
    stale.push({
      file: review.file,
      line: review.line,
      column: review.column,
      reason: 'Review no longer identifies a candidate.',
    })
  return {
    schemaVersion: 1,
    status: pending.length || stale.length ? 'pending' : 'reviewed',
    reviewed,
    pending,
    stale,
    limit:
      'Verifies fresh, complete explicit decisions for recognized candidates. Ownership reasons and opaque/dynamic builders still require semantic review.',
  }
}

function identity({ file, line, column }) {
  return file + ':' + line + ':' + column
}
