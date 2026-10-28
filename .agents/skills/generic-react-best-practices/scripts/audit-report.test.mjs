import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, test } from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  addEslintSnapshot,
  compareAudits,
  createAudit,
  inventory,
  loadCatalog,
  refreshAudit,
  renderAudit,
  summarizeAudit,
  validateAudit,
} from './audit-report.mjs'

const script = fileURLToPath(new URL('./audit-report.mjs', import.meta.url))
const catalog = loadCatalog()
const selectedRules = ['arch-component-roles', 'ui-accessible-names']
const directories = []

afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true })
})

function project() {
  const root = mkdtempSync(join(tmpdir(), 'react-audit-report-'))
  directories.push(root)
  mkdirSync(join(root, 'src'))
  writeFileSync(
    join(root, 'src/Orders.view.tsx'),
    'export function Orders() {return <button>Orders</button>}\n',
  )
  const config = join(root, 'effective.json')
  writeFileSync(config, JSON.stringify({ rules: { 'local/example': 2 } }))
  return { root, config }
}

function completeFixture(mode = 'fix') {
  const fixture = project()
  const state = createAudit(
    { root: fixture.root, include: ['src'], selectedRules, mode, id: 'run-1' },
    catalog,
  )
  for (const file of state.files)
    Object.assign(file, {
      review: 'reviewed',
      evidence: 'Inspected the component role and accessible control name.',
    })
  for (const rule of state.rules) {
    Object.assign(rule, {
      unit: 'component contract',
      review: 'reviewed',
      discovery: 'complete',
      method: 'manual',
      evidence:
        'Enumerated component contracts in every scoped file; inspected the component and its callers.',
    })
    rule.patterns.push({
      id: `${rule.id}:orders`,
      location: { file: 'src/Orders.view.tsx', symbol: 'Orders' },
      result: 'ok',
      evidence: 'Display-only component; native button has visible text.',
      findingIds: [],
      exceptionIds: [],
    })
  }
  addEslintSnapshot(
    state,
    [
      {
        filePath: join(fixture.root, 'src/Orders.view.tsx'),
        messages: [],
        suppressedMessages: [],
        errorCount: 0,
        warningCount: 0,
      },
    ],
    {
      id: 'final',
      command: 'eslint src',
      exitCode: 0,
      configuration: [fixture.config],
    },
  )
  Object.assign(state.eslint, {
    review: 'reviewed',
    configurationEvidence:
      'Saved effective configuration applies to scoped TSX; checked neighboring invalid and valid examples.',
    warningBudget: 0,
  })
  Object.assign(state.exceptionInventory, {
    review: 'reviewed',
    evidence:
      'Inspected comments, configuration disables and scoped exclusions; none present.',
  })
  state.checks.push({
    id: 'tests',
    status: 'passed',
    evidence:
      'Fictional fixture: recorded its successful required behavior checks.',
    sourceFingerprint: summarizeAudit(state).sourceFingerprint,
  })
  return { ...fixture, state }
}

function snapshotWithDiagnostic(
  state,
  root,
  config,
  { severity = 2, suppressed = false, id = 'next', exitCode = 1 } = {},
) {
  const message = {
    ruleId: 'local/example',
    severity,
    line: 1,
    column: 1,
    message: 'A verified example diagnostic.',
  }
  return addEslintSnapshot(
    state,
    [
      {
        filePath: join(root, 'src/Orders.view.tsx'),
        messages: suppressed ? [] : [message],
        suppressedMessages: suppressed ? [message] : [],
      },
    ],
    { id, command: 'eslint src', exitCode, configuration: [config] },
  )
}

function retainedException(diagnosticId) {
  return {
    id: 'exception:orders',
    kind: 'inline',
    status: 'retained',
    location: { file: 'src/Orders.view.tsx', symbol: 'Orders:local/example' },
    ruleIds: ['local/example'],
    diagnosticIds: [diagnosticId],
    reviewedAt: '2026-01-20',
    reason: 'Fictional detector false positive permitted by its contract.',
    evidence: 'Inspected the actual component, caller and detector limitation.',
    probes: [
      {
        ruleId: 'local/example',
        applicable: true,
        diagnosticEvidence:
          'Isolated unmasking reproduced local/example at severity 2.',
      },
    ],
  }
}

test('initialization inventories all catalog rules without certifying any of them', () => {
  const { root } = project()
  const state = createAudit({ root, include: ['src'] }, catalog)
  assert.deepEqual(
    state.rules.map(rule => rule.id),
    catalog.rules.map(rule => rule.id),
  )
  assert.equal(validateAudit(state, { catalog }).complete, false)
  assert.equal(
    state.rules.every(
      rule => rule.review === 'pending' && rule.patterns.length === 0,
    ),
    true,
  )
})

test('a complete evidenced focused audit passes the completion gate', () => {
  const { state } = completeFixture()
  assert.deepEqual(validateAudit(state, { catalog }), {
    errors: [],
    pending: [],
    complete: true,
  })
})

test('a full audit cannot omit a catalog rule', () => {
  const { root } = project()
  const state = createAudit({ root, include: ['src'] }, catalog)
  const removed = state.rules.pop()
  assert.ok(
    validateAudit(state, { catalog }).errors.includes(
      `Missing catalog rule: ${removed.id}`,
    ),
  )
})

test('changing a full audit to focused cannot bypass its initialized scope', () => {
  const { state } = completeFixture()
  state.coverage = 'full'
  assert.ok(
    validateAudit(state, { catalog }).errors.includes(
      'Declared scope changed; initialize a new run rather than narrowing this audit.',
    ),
  )
})

test('counts partition eligible occurrences and keep removed occurrences historical', () => {
  const { state } = completeFixture()
  const rule = state.rules[0]
  const original = rule.patterns[0]
  rule.patterns = ['ok', 'error', 'exempt', 'pending', 'removed'].map(
    result => ({ ...original, id: `orders:${result}`, result }),
  )
  assert.deepEqual(summarizeAudit(state).rules[0], {
    id: rule.id,
    unit: rule.unit,
    review: 'reviewed',
    discovery: 'complete',
    total: 4,
    ok: 1,
    error: 1,
    exempt: 1,
    pending: 1,
    removed: 1,
  })
})

test('zero known occurrences do not certify unfinished discovery', () => {
  const { state } = completeFixture()
  Object.assign(state.rules[0], { patterns: [], discovery: 'pending' })
  assert.equal(summarizeAudit(state).rules[0].total, 0)
  assert.ok(
    validateAudit(state, { catalog }).pending.includes(
      `Rule coverage pending: ${state.rules[0].id}`,
    ),
  )
})

test('not-applicable requires evidence and no occurrences', () => {
  const { state } = completeFixture()
  state.rules[0].review = 'not_applicable'
  assert.ok(
    validateAudit(state, { catalog }).errors.includes(
      `Not-applicable rule has occurrences: ${state.rules[0].id}`,
    ),
  )
})

test('one omitted file review prevents completion even when every rule looks reviewed', () => {
  const { state } = completeFixture()
  state.files[0].review = 'pending'
  assert.ok(
    validateAudit(state, { catalog }).pending.includes(
      'File review pending: src/Orders.view.tsx',
    ),
  )
})

test('duplicate occurrence IDs cannot conceal volume changes', () => {
  const { state } = completeFixture()
  state.rules[1].patterns[0].id = state.rules[0].patterns[0].id
  assert.ok(
    validateAudit(state, { catalog }).errors.some(message =>
      message.startsWith('Duplicate or missing pattern ID:'),
    ),
  )
})

test('different IDs cannot count the same semantic occurrence twice', () => {
  const { state } = completeFixture()
  const rule = state.rules[0]
  rule.patterns.push({
    ...structuredClone(rule.patterns[0]),
    id: 'different-id:same-component',
  })
  assert.ok(
    validateAudit(state, { catalog }).errors.some(message =>
      message.startsWith('Duplicate semantic occurrence:'),
    ),
  )
})

test('an error occurrence must identify the actual open finding', () => {
  const { state } = completeFixture()
  state.rules[0].patterns[0].result = 'error'
  assert.ok(
    validateAudit(state, { catalog }).errors.some(message =>
      message.startsWith('Error pattern has no open finding:'),
    ),
  )
})

test('findings and occurrence links must agree in both directions', () => {
  const { state } = completeFixture()
  const pattern = state.rules[0].patterns[0]
  pattern.result = 'error'
  pattern.findingIds = ['finding:orders']
  state.findings.push({
    id: 'finding:orders',
    status: 'open',
    severity: 'error',
    message: 'Mixed component responsibilities.',
    evidence: 'Inspected the orchestration and independent presentation.',
    patternIds: [],
    diagnosticIds: ['unknown'],
  })
  assert.ok(
    validateAudit(state, { catalog }).errors.includes(
      `Pattern/finding links disagree: ${pattern.id}/finding:orders`,
    ),
  )
})

test('automatic coverage requires configured rejected and accepted neighboring cases', () => {
  const { state } = completeFixture()
  state.rules[0].method = 'automatic'
  assert.ok(
    validateAudit(state, { catalog }).pending.includes(
      `Missing automatic-check proof: ${state.rules[0].id}`,
    ),
  )
})

test('code changes invalidate hashes and refresh preserves history while reopening review', () => {
  const { state, root } = completeFixture()
  const originalSnapshots = structuredClone(state.eslint.snapshots)
  writeFileSync(
    join(root, 'src/Orders.view.tsx'),
    'export function Orders() {return <button>Changed</button>}\n',
  )
  assert.ok(
    validateAudit(state, { catalog }).errors.some(message =>
      message.startsWith('Source inventory changed;'),
    ),
  )
  assert.deepEqual(refreshAudit(state, catalog), ['src/Orders.view.tsx'])
  assert.deepEqual(state.eslint.snapshots, originalSnapshots)
  assert.equal(state.rules[0].patterns[0].result, 'pending')
  assert.equal(state.files[0].review, 'pending')
  assert.equal(validateAudit(state, { catalog }).complete, false)
})

test('refresh retains deleted-file obligations and inventories new files', () => {
  const { state, root } = completeFixture()
  renameSync(
    join(root, 'src/Orders.view.tsx'),
    join(root, 'src/Results.view.tsx'),
  )
  assert.deepEqual(refreshAudit(state, catalog), [
    'src/Orders.view.tsx',
    'src/Results.view.tsx',
  ])
  assert.deepEqual(
    state.files.map(file => [file.path, file.present, file.review]),
    [
      ['src/Orders.view.tsx', false, 'pending'],
      ['src/Results.view.tsx', true, 'pending'],
    ],
  )
  assert.deepEqual(validateAudit(state, { catalog }).errors, [])
})

test('an imported baseline error remains in the exhaustive report after a clean final run', () => {
  const { state, root, config } = completeFixture()
  state.eslint.snapshots = []
  const before = snapshotWithDiagnostic(state, root, config, { id: 'before' })
  addEslintSnapshot(
    state,
    [
      {
        filePath: join(root, 'src/Orders.view.tsx'),
        messages: [],
        suppressedMessages: [],
      },
    ],
    {
      id: 'after',
      command: 'eslint src',
      exitCode: 0,
      configuration: [config],
    },
  )
  state.eslint.review = 'reviewed'
  state.findings.push({
    id: 'finding:baseline',
    severity: 'error',
    status: 'fixed',
    message: 'Original detected violation.',
    evidence: 'Saved the baseline diagnostic.',
    patternIds: [],
    diagnosticIds: [before.diagnostics[0].id],
    verification:
      'The targeted regression and final actual configuration reject the original case and accept the correction.',
  })
  const validation = validateAudit(state, { catalog })
  assert.equal(validation.complete, true)
  assert.deepEqual(
    summarizeAudit(state).snapshots.map(snapshot => snapshot.errors),
    [1, 0],
  )
  assert.match(
    renderAudit(state, validation),
    /A verified example diagnostic\./,
  )
})

test('a diagnostic still reported in the final run cannot be marked fixed', () => {
  const { state, root, config } = completeFixture()
  const snapshot = snapshotWithDiagnostic(state, root, config)
  state.findings.push({
    id: 'finding:stale-fix',
    severity: 'error',
    status: 'fixed',
    message: 'Claimed correction.',
    evidence: 'Old diagnosis.',
    patternIds: [],
    diagnosticIds: [snapshot.diagnostics[0].id],
    verification: 'A stale verification claim.',
  })
  assert.ok(
    validateAudit(state, { catalog }).errors.includes(
      `Current ESLint diagnostic is marked fixed: ${snapshot.diagnostics[0].id}`,
    ),
  )
})

test('suppressed diagnostics remain separate from errors and need verified exception decisions', () => {
  const { state, root, config } = completeFixture()
  const snapshot = snapshotWithDiagnostic(state, root, config, {
    suppressed: true,
    exitCode: 0,
  })
  const exception = retainedException(snapshot.diagnostics[0].id)
  state.exceptions.push(exception)
  state.eslint.review = 'reviewed'
  assert.equal(validateAudit(state, { catalog }).complete, true)
  assert.equal(summarizeAudit(state).snapshots.at(-1).errors, 0)
  assert.equal(summarizeAudit(state).snapshots.at(-1).suppressed, 1)
})

test('exception metadata cannot replace a probe for each named rule', () => {
  const { state, root, config } = completeFixture()
  const snapshot = snapshotWithDiagnostic(state, root, config, {
    suppressed: true,
    exitCode: 0,
  })
  const exception = retainedException(snapshot.diagnostics[0].id)
  exception.ruleIds.push('complexity')
  state.exceptions.push(exception)
  assert.ok(
    validateAudit(state, { catalog }).pending.includes(
      'Missing underlying-diagnostic/applicability evidence: exception:orders/complexity',
    ),
  )
})

test('warning ceilings may not leave spare capacity after accepted warnings', () => {
  const { state, root, config } = completeFixture()
  const snapshot = snapshotWithDiagnostic(state, root, config, {
    severity: 1,
    exitCode: 0,
  })
  state.exceptions.push(retainedException(snapshot.diagnostics[0].id))
  Object.assign(state.eslint, { review: 'reviewed', warningBudget: 2 })
  assert.ok(
    validateAudit(state, { catalog }).pending.includes(
      'ESLint warning budget must equal the global warning total.',
    ),
  )
})

test('findings-only mode can finish review with documented open violations', () => {
  const { state, root, config } = completeFixture('findings-only')
  const pattern = state.rules[0].patterns[0]
  pattern.result = 'error'
  pattern.findingIds = ['finding:open']
  const snapshot = snapshotWithDiagnostic(state, root, config)
  state.eslint.review = 'reviewed'
  state.findings.push({
    id: 'finding:open',
    severity: 'error',
    status: 'open',
    message: 'Confirmed role violation.',
    evidence:
      'The component owns orchestration and an independent presentational subtree.',
    patternIds: [pattern.id],
    diagnosticIds: [snapshot.diagnostics[0].id],
  })
  state.checks.push({
    id: 'eslint',
    status: 'failed',
    evidence: 'ESLint exited 1 and reported the recorded open finding.',
    sourceFingerprint: summarizeAudit(state).sourceFingerprint,
  })
  assert.equal(validateAudit(state, { catalog }).complete, true)
  assert.match(
    renderAudit(state, validateAudit(state, { catalog })),
    /\| eslint \| failed \|/,
  )
})

test('fix mode cannot finish on the same open violation', () => {
  const { state } = completeFixture()
  const pattern = state.rules[0].patterns[0]
  Object.assign(pattern, { result: 'error', findingIds: ['finding:open'] })
  state.findings.push({
    id: 'finding:open',
    severity: 'error',
    status: 'open',
    message: 'Confirmed role violation.',
    evidence: 'Inspected the component and actual callers.',
    patternIds: [pattern.id],
    diagnosticIds: [],
  })
  assert.equal(validateAudit(state, { catalog }).complete, false)
})

test('comparison flags changed counting units and contracts instead of implying improvement', () => {
  const { state } = completeFixture()
  const previous = structuredClone(state)
  state.rules[0].unit = 'rendered element'
  state.rules[1].contractHash = 'a'.repeat(64)
  assert.deepEqual(
    compareAudits(previous, state).rows.map(row => row.comparable),
    [false, false],
  )
})

test('comparison reports changed scope and configuration explicitly', () => {
  const { state } = completeFixture()
  const previous = structuredClone(state)
  state.scope.include.push('tests')
  state.eslint.snapshots[0].configFingerprint = 'different'
  const result = compareAudits(previous, state)
  assert.equal(result.eslintComparable, false)
  assert.equal(
    result.rows.every(row =>
      row.reasons.includes('scope, exclusions or audit mode changed'),
    ),
    true,
  )
})

test('ESLint comparison is not established without captured toolchain inputs', () => {
  const { state } = completeFixture()
  assert.equal(
    compareAudits(structuredClone(state), state).eslintComparable,
    false,
  )
})

test('a changed detector implementation invalidates ESLint comparison with unchanged configuration', () => {
  const { state, root, config } = completeFixture()
  const detector = join(root, 'detector.js')
  writeFileSync(detector, 'export const implementation = 1')
  const results = [
    {
      filePath: join(root, 'src/Orders.view.tsx'),
      messages: [],
      suppressedMessages: [],
    },
  ]
  addEslintSnapshot(state, results, {
    id: 'toolchain-before',
    command: 'eslint src',
    exitCode: 0,
    configuration: [config],
    tooling: [detector],
  })
  state.eslint.review = 'reviewed'
  const previous = structuredClone(state)
  assert.equal(
    compareAudits(previous, structuredClone(previous)).eslintComparable,
    true,
  )
  writeFileSync(detector, 'export const implementation = 2')
  addEslintSnapshot(state, results, {
    id: 'toolchain-after',
    command: 'eslint src',
    exitCode: 0,
    configuration: [config],
    tooling: [detector],
  })
  state.eslint.review = 'reviewed'
  assert.equal(
    previous.eslint.snapshots.at(-1).configFingerprint,
    state.eslint.snapshots.at(-1).configFingerprint,
  )
  assert.equal(compareAudits(previous, state).eslintComparable, false)
})

test('unchanged global totals do not hide replaced occurrence identities', () => {
  const { state } = completeFixture()
  const previous = structuredClone(state)
  const oldId = state.rules[0].patterns[0].id
  state.rules[0].patterns[0].id = 'arch-component-roles:other'
  const row = compareAudits(previous, state).rows[0]
  assert.equal(row.before.total, row.after.total)
  assert.deepEqual(row.absent, [oldId])
  assert.deepEqual(row.added, ['arch-component-roles:other'])
  assert.deepEqual(row.transitions, [])
})

test('a line move preserves semantic occurrence identity', () => {
  const { state } = completeFixture()
  const previous = structuredClone(state)
  state.rules[0].patterns[0].location.line = 25
  const row = compareAudits(previous, state).rows[0]
  assert.equal(row.comparable, true)
  assert.deepEqual(
    { added: row.added, absent: row.absent, transitions: row.transitions },
    { added: [], absent: [], transitions: [] },
  )
})

test('reports retain every catalog row and distinguish unselected rules from not-applicable ones', () => {
  const { state } = completeFixture()
  const report = renderAudit(state, validateAudit(state, { catalog }))
  const ids = new Set(catalog.rules.map(rule => rule.id))
  const rows = report
    .split('\n')
    .map(line => line.split('|')[1]?.trim())
    .filter(id => ids.has(id))
  assert.deepEqual(rows.sort(), [...ids].sort())
  assert.match(report, /\| api-void-mutation \|.*out of focused scope/)
  assert.match(report, /OK occurrence counts: \*\*not measured by ESLint\*\*/)
})

test('large diagnostic lists are retained exhaustively in the artifact', () => {
  const { state, root, config } = completeFixture()
  const messages = Array.from({ length: 250 }, (_, index) => ({
    ruleId: 'local/example',
    severity: 2,
    line: 1,
    column: index + 1,
    message: `Violation number ${index + 1}`,
  }))
  const snapshot = addEslintSnapshot(
    state,
    [{ filePath: join(root, 'src/Orders.view.tsx'), messages }],
    {
      id: 'large',
      command: 'eslint src',
      exitCode: 1,
      configuration: [config],
    },
  )
  const report = renderAudit(state, validateAudit(state, { catalog }))
  const diagnosticRows = report
    .split('\n')
    .filter(line => /^\| large:\d+ \| large \|/u.test(line))
  assert.equal(snapshot.diagnostics.length, 250)
  assert.equal(diagnosticRows.length, 250)
})

test('ESLint import rejects inconsistent raw counts instead of trusting a total', () => {
  const { state, root, config } = completeFixture()
  assert.throws(
    () =>
      addEslintSnapshot(
        state,
        [
          {
            filePath: join(root, 'src/Orders.view.tsx'),
            errorCount: 0,
            messages: [
              { severity: 2, ruleId: 'local/example', message: 'Failure' },
            ],
          },
        ],
        {
          id: 'invalid',
          command: 'eslint src',
          exitCode: 1,
          configuration: [config],
        },
      ),
    /errorCount disagrees/,
  )
})

test('parser diagnostics remain visible text in the Markdown report', () => {
  const { state, root, config } = completeFixture()
  addEslintSnapshot(
    state,
    [
      {
        filePath: join(root, 'src/Orders.view.tsx'),
        messages: [
          {
            ruleId: null,
            fatal: true,
            severity: 2,
            message: 'Unexpected <button> & value',
          },
        ],
      },
    ],
    {
      id: 'parser',
      command: 'eslint src',
      exitCode: 1,
      configuration: [config],
    },
  )
  const report = renderAudit(state, validateAudit(state, { catalog }))
  assert.match(report, /&lt;parser&gt;/)
  assert.match(report, /Unexpected &lt;button&gt; &amp; value/)
})

test('a clean empty ESLint report cannot certify omitted scoped source', () => {
  const { state, config } = completeFixture()
  addEslintSnapshot(state, [], {
    id: 'empty',
    command: 'eslint wrong-scope',
    exitCode: 0,
    configuration: [config],
  })
  state.eslint.review = 'reviewed'
  assert.ok(
    validateAudit(state, { catalog }).pending.includes(
      'Scoped source missing from ESLint results: src/Orders.view.tsx',
    ),
  )
})

test('inventory refuses paths outside the declared project', () => {
  const { root } = project()
  assert.throws(
    () => createAudit({ root, include: ['..'] }, catalog),
    /leaves project root/,
  )
})

test('inventory requires an explicit decision for symlinks', () => {
  const { root } = project()
  symlinkSync(join(root, 'src/Orders.view.tsx'), join(root, 'src/alias.tsx'))
  assert.throws(
    () => inventory({ root, include: ['src'], exclude: [] }),
    /symlinks explicitly/,
  )
})

test('scope exclusions need retained review decisions before completion', () => {
  const { state } = completeFixture()
  state.scope.exclude.push({
    path: 'src/generated',
    reason: 'Generated fixtures.',
  })
  assert.ok(
    validateAudit(state, { catalog }).pending.includes(
      'Exclusion not reviewed: src/generated',
    ),
  )
})

test('the CLI produces a persistent pending state and fails its completion gate', () => {
  const { root } = project()
  const statePath = join(root, 'run.json')
  const initialized = spawnSync(
    process.execPath,
    [script, 'init', '--root', root, '--scope', 'src', '--out', statePath],
    { encoding: 'utf8' },
  )
  assert.equal(initialized.status, 0, initialized.stderr)
  const checked = spawnSync(
    process.execPath,
    [script, 'check', '--audit', statePath, '--complete'],
    { encoding: 'utf8' },
  )
  assert.equal(checked.status, 1)
  assert.equal(JSON.parse(checked.stdout).complete, false)
})

test('the CLI refuses to overwrite a previous run', () => {
  const { root } = project()
  const statePath = join(root, 'run.json')
  writeFileSync(statePath, 'retain previous evidence')
  const result = spawnSync(
    process.execPath,
    [script, 'init', '--root', root, '--scope', 'src', '--out', statePath],
    { encoding: 'utf8' },
  )
  assert.equal(result.status, 1)
  assert.equal(readFileSync(statePath, 'utf8'), 'retain previous evidence')
})

test('the CLI rejects misspelled completion flags rather than silently accepting them', () => {
  const result = spawnSync(
    process.execPath,
    [script, 'check', '--audit', 'unused.json', '--complet'],
    { encoding: 'utf8' },
  )
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Unknown check option/)
})

test('the CLI keeps its artifacts outside the inspected source set', () => {
  const { root } = project()
  const result = spawnSync(
    process.execPath,
    [
      script,
      'init',
      '--root',
      root,
      '--scope',
      'src',
      '--out',
      join(root, 'src/run.json'),
    ],
    { encoding: 'utf8' },
  )
  assert.equal(result.status, 1)
  assert.match(result.stderr, /outside the inspected source paths/)
})

test('the CLI cannot replace a JSON checkpoint with its rendered Markdown', () => {
  const { state, root } = completeFixture()
  const statePath = join(root, 'run.json')
  const contents = JSON.stringify(state)
  writeFileSync(statePath, contents)
  const result = spawnSync(
    process.execPath,
    [script, 'render', '--audit', statePath, '--out', statePath],
    { encoding: 'utf8' },
  )
  assert.equal(result.status, 1)
  assert.equal(readFileSync(statePath, 'utf8'), contents)
})
