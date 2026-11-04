import { describe, expect, it } from 'vitest'

import { calculateAuditMetrics } from './audit-metrics.mjs'

const rule = (id, impact, coverage = 'complete') => ({ id, impact, coverage })
const finding = (id, ruleIds, status = 'open', kind = 'violation') => ({
  id,
  ruleIds,
  status,
  kind,
  files: ['src/example.ts'],
})
const input = (rules, findings = []) => ({
  schemaVersion: 1,
  scope: 'example/full',
  rules,
  findings,
  unreviewedExceptions: 0,
})

describe('versioned audit metrics', () => {
  it.each([
    ['CRITICAL', 3.03],
    ['HIGH', 5.88],
    ['MEDIUM-HIGH', 11.11],
    ['MEDIUM', 20],
    ['LOW-MEDIUM', 33.33],
    ['LOW', 50],
  ])(
    'keeps the v1 penalty for %s relative to one clean LOW rule',
    (impact, score) => {
      expect(
        calculateAuditMetrics(
          input(
            [rule('failed', impact), rule('clean', 'LOW')],
            [finding('F1', ['failed'])],
          ),
        ).score,
      ).toBe(score)
    },
  )
  it('weights actual owning rules and counts families separately from files', () => {
    const result = calculateAuditMetrics(
      input([rule('a', 'HIGH'), rule('b', 'MEDIUM')], [finding('F1', ['b'])]),
    )
    expect(result.score).toBe(80)
    expect(result.openAffectedFiles).toBe(1)
    expect(result.volumes.MEDIUM).toEqual({ baseline: 1, open: 1, resolved: 0 })
  })
  it('keeps the score invariant when a violation is split into several findings', () => {
    const rules = [rule('a', 'CRITICAL'), rule('b', 'LOW')]
    const grouped = calculateAuditMetrics(input(rules, [finding('F1', ['a'])]))
    const split = calculateAuditMetrics(
      input(rules, [finding('F1', ['a']), finding('F2', ['a'])]),
    )
    expect(split.score).toBe(grouped.score)
    expect(split.volumes.CRITICAL.open).toBe(2)
  })
  it('uses the highest impact once per family while scoring each violated rule once', () => {
    const result = calculateAuditMetrics(
      input([rule('a', 'HIGH'), rule('b', 'LOW')], [finding('F1', ['a', 'b'])]),
    )
    expect(result.score).toBe(0)
    expect(result.volumes.HIGH.open).toBe(1)
    expect(result.volumes.LOW.open).toBe(0)
  })
  it('preserves resolved volumes and excludes ambiguities from confirmed penalties', () => {
    const result = calculateAuditMetrics(
      input(
        [rule('a', 'MEDIUM')],
        [
          finding('F1', ['a'], 'resolved'),
          finding('F2', ['a'], 'open', 'ambiguity'),
        ],
      ),
    )
    expect(result.score).toBe(100)
    expect(result.volumes.MEDIUM).toEqual({ baseline: 1, open: 0, resolved: 1 })
    expect(result.otherOpenFindings.ambiguity).toBe(1)
  })
  it.each(['pending', 'not-applicable'])(
    'withholds the score for %s-only coverage',
    (coverage) => {
      expect(
        calculateAuditMetrics(input([rule('a', 'HIGH', coverage)])).score,
      ).toBeNull()
    },
  )
  it('discloses unreviewed exceptions without assuming they are violations', () => {
    expect(
      calculateAuditMetrics({
        ...input([rule('a', 'LOW')]),
        unreviewedExceptions: 2,
      }),
    ).toMatchObject({
      score: 100,
      unreviewedExceptions: 2,
      assurance: 'reviewed scope excluding unrevalidated exceptions',
    })
  })
  it.each([
    input([rule('a', 'OTHER')]),
    input([rule('a', 'HIGH'), rule('a', 'HIGH')]),
    input([rule('a', 'LOW')], [finding('F1', ['missing'])]),
    input([rule('a', 'LOW')], [finding('F1', ['a']), finding('F1', ['a'])]),
    input([rule('a', 'LOW', 'not-applicable')], [finding('F1', ['a'])]),
    { ...input([]), schemaVersion: 2 },
    { ...input([]), unreviewedExceptions: -1 },
  ])('rejects invalid input without producing a misleading score', (value) => {
    expect(() => calculateAuditMetrics(value)).toThrow()
  })
})
