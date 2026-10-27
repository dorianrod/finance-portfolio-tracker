import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const dashboard = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const input = process.argv[2]
if (!input)
  throw new Error(
    'Usage: node scripts/summarize-eslint-history.mjs results.json [coverage.json]',
  )
const history = JSON.parse(readFileSync(input, 'utf8'))
const cases = JSON.parse(
  readFileSync(new URL('./eslint-history-cases.json', import.meta.url), 'utf8'),
)
const repository = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  cwd: dashboard,
  encoding: 'utf8',
}).trim()
const baseline = history.results[0]
const paths = execFileSync(
  'git',
  ['ls-tree', '-r', '--name-only', baseline.hash, 'packages/dashboard/src'],
  { cwd: repository, encoding: 'utf8' },
)
  .trim()
  .split('\n')
const source = new Map()
const coverage = cases.map((entry) => {
  if (entry.manual) return { ...entry, status: 'manual' }
  const checks = entry.checks.map(([suffix, needle, ruleId, messageId]) => {
    const candidates = paths.filter((path) => path.endsWith('/' + suffix))
    const matches = candidates.flatMap((path) => {
      if (!source.has(path))
        source.set(
          path,
          execFileSync('git', ['show', `${baseline.hash}:${path}`], {
            cwd: repository,
            encoding: 'utf8',
          }).split('\n'),
        )
      return source.get(path).flatMap((line, index) =>
        line.includes(needle)
          ? [
              {
                file: path.slice('packages/dashboard/'.length),
                line: index + 1,
              },
            ]
          : [],
      )
    })
    if (!matches.length)
      throw new Error(
        `Missing historical evidence for ${entry.id}: ${suffix}: ${needle}`,
      )
    const findings = baseline.findings.filter(
      (finding) =>
        finding.ruleId === ruleId &&
        (!messageId || finding.messageId === messageId) &&
        matches.some(
          (match) =>
            finding.file === match.file &&
            finding.line <= match.line &&
            (finding.endLine ?? finding.line) >= match.line,
        ),
    )
    return {
      file: suffix,
      needle,
      ruleId,
      messageId,
      matches,
      findings,
      detected: findings.length > 0,
    }
  })
  const detected = checks.filter((check) => check.detected).length
  return {
    ...entry,
    checks,
    status:
      detected === checks.length
        ? 'detected'
        : detected > 0
          ? 'partial'
          : 'missed',
  }
})
const counts = Object.fromEntries(
  ['detected', 'partial', 'manual', 'missed'].map((status) => [
    status,
    coverage.filter((entry) => entry.status === status).length,
  ]),
)
const result = {
  baseline: baseline.hash,
  ruleFingerprint: history.ruleFingerprint,
  scope:
    '28 grouped findings from DORIAN_REACT_AUDIT.md, checked against explicit historical code anchors. A detected anchor proves a diagnostic, not an automatic or complete semantic repair.',
  counts,
  coverage,
}
if (process.argv[3])
  writeFileSync(
    resolve(process.argv[3]),
    JSON.stringify(result, null, 2) + '\n',
  )
process.stdout.write(
  JSON.stringify(
    {
      ...result,
      coverage: coverage.map(({ checks, ...entry }) => ({
        ...entry,
        checks: checks?.map((check) => ({
          file: check.file,
          needle: check.needle,
          detected: check.detected,
        })),
      })),
    },
    null,
    2,
  ) + '\n',
)
