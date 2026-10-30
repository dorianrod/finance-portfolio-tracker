#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'

import { isMain } from './project-options.mjs'

const WEIGHTS = Object.freeze({
  CRITICAL: 32,
  HIGH: 16,
  'MEDIUM-HIGH': 8,
  MEDIUM: 4,
  'LOW-MEDIUM': 2,
  LOW: 1,
})
const KINDS = ['violation', 'ambiguity', 'prevention-gap', 'suggestion']

export function calculateAuditMetrics(input) {
  if (
    input?.schemaVersion !== 1 ||
    typeof input.scope !== 'string' ||
    !input.scope.trim() ||
    !Array.isArray(input.rules) ||
    !Array.isArray(input.findings) ||
    !Number.isSafeInteger(input.unreviewedExceptions) ||
    input.unreviewedExceptions < 0
  )
    throw new Error(
      'Expected metrics schemaVersion 1, scope, rules, findings and unreviewedExceptions.',
    )
  const rules = new Map()
  for (const rule of input.rules) {
    if (
      typeof rule.id !== 'string' ||
      !rule.id.trim() ||
      rules.has(rule.id) ||
      !Object.hasOwn(WEIGHTS, rule.impact) ||
      !['complete', 'pending', 'not-applicable'].includes(rule.coverage)
    )
      throw new Error('Invalid or duplicate rule: ' + String(rule.id))
    rules.set(rule.id, rule)
  }
  const volumes = Object.fromEntries(
    Object.keys(WEIGHTS).map((impact) => [
      impact,
      {
        baseline: 0,
        open: 0,
        resolved: 0,
      },
    ]),
  )
  const ids = new Set(),
    violated = new Set(),
    files = new Set()
  const otherFindings = Object.fromEntries(
    KINDS.slice(1).map((kind) => [kind, 0]),
  )
  for (const finding of input.findings) {
    if (
      typeof finding.id !== 'string' ||
      !finding.id.trim() ||
      ids.has(finding.id) ||
      !KINDS.includes(finding.kind) ||
      !['open', 'resolved'].includes(finding.status) ||
      !Array.isArray(finding.ruleIds) ||
      !finding.ruleIds.length ||
      new Set(finding.ruleIds).size !== finding.ruleIds.length ||
      finding.ruleIds.some((id) => !rules.has(id)) ||
      !Array.isArray(finding.files) ||
      (finding.kind === 'violation' && !finding.files.length) ||
      finding.files.some((file) => typeof file !== 'string' || !file.trim())
    )
      throw new Error('Invalid or duplicate finding: ' + String(finding.id))
    ids.add(finding.id)
    if (finding.kind !== 'violation') {
      if (finding.status === 'open') otherFindings[finding.kind]++
      continue
    }
    if (
      finding.ruleIds.some((id) => rules.get(id).coverage === 'not-applicable')
    )
      throw new Error('A violation cannot reference a non-applicable rule.')
    const impact = finding.ruleIds
      .map((id) => rules.get(id).impact)
      .reduce((highest, value) =>
        WEIGHTS[value] > WEIGHTS[highest] ? value : highest,
      )
    volumes[impact].baseline++
    volumes[impact][finding.status === 'open' ? 'open' : 'resolved']++
    if (finding.status === 'open') {
      finding.ruleIds.forEach((id) => violated.add(id))
      finding.files.forEach((file) => files.add(file))
    }
  }
  const applicable = [...rules.values()].filter(
    (rule) => rule.coverage !== 'not-applicable',
  )
  const pending = applicable
    .filter((rule) => rule.coverage === 'pending')
    .map((rule) => rule.id)
  const denominator = applicable.reduce(
    (sum, rule) => sum + WEIGHTS[rule.impact],
    0,
  )
  const penalty = [...violated].reduce(
    (sum, id) => sum + WEIGHTS[rules.get(id).impact],
    0,
  )
  return {
    formulaVersion: 'weighted-rule-compliance/v1',
    scope: input.scope,
    weights: WEIGHTS,
    formula: '100 * (1 - openViolatedRuleWeight / applicableRuleWeight)',
    score:
      pending.length || !denominator
        ? null
        : Math.round(10000 * (1 - penalty / denominator)) / 100,
    scoreStatus: pending.length
      ? 'incomplete-review'
      : denominator
        ? 'calculated'
        : 'no-applicable-rules',
    applicableRuleWeight: denominator,
    openViolatedRuleWeight: penalty,
    openViolatedRuleIds: [...violated].sort(),
    coverage: { selected: rules.size, applicable: applicable.length, pending },
    unreviewedExceptions: input.unreviewedExceptions,
    assurance: input.unreviewedExceptions
      ? 'reviewed scope excluding unrevalidated exceptions'
      : 'reviewed scope',
    volumes,
    otherOpenFindings: otherFindings,
    openAffectedFiles: files.size,
  }
}

if (isMain(import.meta.url)) {
  try {
    const { values } = parseArgs({ options: { input: { type: 'string' } } })
    if (!values.input) throw new Error('Pass --input <metrics-input.json>.')
    const result = calculateAuditMetrics(
      JSON.parse(readFileSync(values.input, 'utf8')),
    )
    process.stdout.write(JSON.stringify(result, null, 2) + '\n')
  } catch (error) {
    process.stderr.write(String(error.message) + '\n')
    process.exitCode = 2
  }
}
