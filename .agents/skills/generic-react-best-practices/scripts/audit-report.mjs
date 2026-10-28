#!/usr/bin/env node
import { createHash } from 'node:crypto'
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const RESULTS = ['ok', 'error', 'exempt', 'pending', 'removed']
const nonempty = value => typeof value === 'string' && value.trim().length > 0
const hash = value => createHash('sha256').update(value).digest('hex')
const jsonHash = value => hash(JSON.stringify(value))

export function loadCatalog(skillDirectory = SKILL_DIR) {
  const skill = readFileSync(resolve(skillDirectory, 'SKILL.md'), 'utf8')
  const metadata = JSON.parse(
    readFileSync(resolve(skillDirectory, 'metadata.json'), 'utf8'),
  )
  const rules = [...skill.matchAll(/^- `([a-z0-9-]+)` - /gm)].map(([, id]) => ({
    id,
    contractHash: hash(
      readFileSync(resolve(skillDirectory, 'rules', `${id}.md`)),
    ),
  }))
  if (
    !rules.length ||
    new Set(rules.map(rule => rule.id)).size !== rules.length
  )
    throw new Error('The catalog must list each rule exactly once.')
  return {
    name: 'generic-react-best-practices',
    version: metadata.version,
    rules,
    fingerprint: jsonHash(rules),
  }
}

export function inventory(scope) {
  const root = realpathSync(scope.root)
  const found = new Map()
  const walk = (path, ancestors = new Set()) => {
    const name = projectPath(root, path)
    if (scope.exclude.some(entry => contains(entry.path, name))) return
    const absolute = resolve(root, name)
    let info
    try {
      info = lstatSync(absolute)
    } catch (error) {
      if (error.code === 'ENOENT') return
      throw error
    }
    if (info.isSymbolicLink())
      throw new Error(
        `Inventory symlinks explicitly or exclude them with a reason: ${name}`,
      )
    const real = realpathSync(absolute)
    projectPath(root, real)
    if (info.isDirectory()) {
      if (ancestors.has(real)) throw new Error(`Inventory cycle: ${name}`)
      const next = new Set([...ancestors, real])
      for (const entry of readdirSync(absolute).sort())
        walk(resolve(absolute, entry), next)
    } else if (info.isFile()) {
      found.set(name, hash(readFileSync(absolute)))
    }
  }
  for (const path of scope.include) walk(path)
  return [...found]
    .sort(([a], [b]) => a.localeCompare(b, 'en'))
    .map(([path, sha256]) => ({ path, sha256 }))
}

export function createAudit(
  {
    root,
    include,
    exclude = [],
    selectedRules,
    mode = 'fix',
    id = new Date().toISOString(),
  },
  catalog = loadCatalog(),
) {
  const scope = {
    root: realpathSync(root),
    include: [...new Set(include.map(path => projectPath(root, path)))].sort(),
    exclude: exclude.map(entry => ({
      path: projectPath(root, entry.path),
      reason: entry.reason,
    })),
  }
  if (!scope.include.length)
    throw new Error('At least one explicit scope path is required.')
  if (scope.include.some(path => !existsSync(resolve(scope.root, path))))
    throw new Error('Initial scope paths must exist.')
  if (scope.exclude.some(entry => !nonempty(entry.reason)))
    throw new Error('Every exclusion needs a reason.')
  if (!['fix', 'findings-only'].includes(mode))
    throw new Error('Mode must be fix or findings-only.')
  const ids = selectedRules ?? catalog.rules.map(rule => rule.id)
  if (
    !ids.length ||
    new Set(ids).size !== ids.length ||
    ids.some(id => !catalog.rules.some(rule => rule.id === id))
  )
    throw new Error('Selected rules must be distinct catalog IDs.')
  const rules = catalog.rules
    .filter(rule => ids.includes(rule.id))
    .map(rule => ({
      ...rule,
      unit: '',
      review: 'pending',
      discovery: 'pending',
      method: '',
      evidence: '',
      automaticChecks: [],
      patterns: [],
    }))
  const files = inventory(scope).map(file => ({
    ...file,
    present: true,
    review: 'pending',
    evidence: '',
  }))
  const audit = {
    schemaVersion: 1,
    id,
    mode,
    coverage: selectedRules ? 'focused' : 'full',
    skill: catalog,
    scope,
    files,
    rules,
    findings: [],
    exceptions: [],
    exceptionInventory: { review: 'pending', evidence: '' },
    eslint: {
      review: 'pending',
      configurationEvidence: '',
      warningBudget: null,
      snapshots: [],
    },
    checks: [],
  }
  audit.declaredScopeFingerprint = scopeSignature(audit)
  return audit
}

export function refreshAudit(audit, catalog = loadCatalog()) {
  const oldIds = audit.skill.rules.map(rule => rule.id).sort()
  if (
    JSON.stringify(oldIds) !==
    JSON.stringify(catalog.rules.map(rule => rule.id).sort())
  )
    throw new Error(
      'Catalog membership changed. Initialize a new run and retain this state for comparison.',
    )
  const current = new Map(
    inventory(audit.scope).map(file => [file.path, file.sha256]),
  )
  const old = new Map(audit.files.map(file => [file.path, file]))
  const changed = new Set()
  for (const [path, sha256] of current) {
    const previous = old.get(path)
    if (!previous || !previous.present || previous.sha256 !== sha256)
      changed.add(path)
  }
  for (const file of audit.files)
    if (file.present && !current.has(file.path)) changed.add(file.path)
  audit.files = [...new Set([...old.keys(), ...current.keys()])]
    .sort()
    .map(path => {
      const previous = old.get(path)
      const file = {
        ...previous,
        path,
        sha256: current.get(path) ?? previous.sha256,
        present: current.has(path),
      }
      if (changed.has(path))
        Object.assign(file, { review: 'pending', evidence: '' })
      return file
    })
  for (const rule of audit.rules) {
    const contract = catalog.rules.find(entry => entry.id === rule.id)
    if (changed.size || rule.contractHash !== contract.contractHash) {
      rule.review = 'pending'
      rule.discovery = 'pending'
      rule.evidence = ''
      for (const pattern of rule.patterns) {
        if (
          changed.has(pattern.location.file) &&
          (!current.has(pattern.location.file) || pattern.result !== 'error')
        )
          pattern.result = 'pending'
      }
    }
    rule.contractHash = contract.contractHash
  }
  if (changed.size || audit.skill.fingerprint !== catalog.fingerprint) {
    audit.exceptionInventory = { review: 'pending', evidence: '' }
    audit.eslint.review = 'pending'
    for (const check of audit.checks)
      if (check.status !== 'not_applicable') check.status = 'pending'
    for (const exception of audit.exceptions) {
      exception.status = 'pending'
      exception.reviewedAt = null
    }
  }
  audit.skill = catalog
  return [...changed].sort()
}

export function addEslintSnapshot(
  audit,
  results,
  { id, command, exitCode, configuration, tooling = [] },
) {
  if (
    !nonempty(id) ||
    audit.eslint.snapshots.some(snapshot => snapshot.id === id)
  )
    throw new Error('ESLint snapshot IDs must be nonempty and unique.')
  if (
    !Array.isArray(results) ||
    !nonempty(command) ||
    !Number.isInteger(exitCode) ||
    exitCode < 0 ||
    exitCode > 255
  )
    throw new Error(
      'Provide ESLint JSON, the command and its actual exit code.',
    )
  if (!configuration?.length)
    throw new Error('Provide saved effective ESLint configuration files.')
  const configurationHashes = configuration
    .map(path => {
      const content = readFileSync(path)
      const config = JSON.parse(content.toString('utf8'))
      if (!config || !config.rules || typeof config.rules !== 'object')
        throw new Error(
          `Expected saved effective ESLint configuration with rules: ${path}`,
        )
      return hash(content)
    })
    .sort()
  const toolingHashes = tooling.map(path => ({
    path: resolve(path),
    sha256: hash(readFileSync(path)),
  }))
  const diagnostics = []
  const files = []
  for (const result of results) {
    const file = projectPath(audit.scope.root, result.filePath)
    if (files.includes(file))
      throw new Error(`Duplicate ESLint file result: ${file}`)
    for (const [key, severity] of [
      ['errorCount', 2],
      ['warningCount', 1],
    ]) {
      if (
        result[key] != null &&
        result[key] !==
          (result.messages ?? []).filter(
            message => message.severity === severity,
          ).length
      )
        throw new Error(
          `ESLint ${key} disagrees with the diagnostic list: ${file}`,
        )
    }
    files.push(file)
    for (const [suppressed, messages] of [
      [false, result.messages ?? []],
      [true, result.suppressedMessages ?? []],
    ]) {
      for (const message of messages) {
        diagnostics.push({
          id: `${id}:${diagnostics.length + 1}`,
          file,
          ruleId:
            message.ruleId ?? (message.fatal ? '<parser>' : '<unattributed>'),
          severity: message.severity,
          line: message.line ?? null,
          column: message.column ?? null,
          message: message.message,
          messageId: message.messageId ?? null,
          suppressed,
        })
      }
    }
  }
  const snapshot = {
    id,
    command,
    exitCode,
    recordedAt: new Date().toISOString(),
    sourceFingerprint: sourceFingerprint(inventory(audit.scope)),
    configFingerprint: jsonHash(configurationHashes),
    configurationHashes,
    toolingHashes,
    toolchainFingerprint: toolingHashes.length
      ? jsonHash(toolingHashes.map(item => item.sha256).sort())
      : null,
    files: [...new Set(files)].sort(),
    diagnostics,
  }
  audit.eslint.snapshots.push(snapshot)
  audit.eslint.review = 'pending'
  return snapshot
}

export function validateAudit(
  audit,
  { catalog = loadCatalog(), currentSources = true } = {},
) {
  const errors = []
  const pending = []
  const require = (condition, message) => {
    if (!condition) errors.push(message)
  }
  const unfinished = (condition, message) => {
    if (!condition) pending.push(message)
  }
  if (
    !audit ||
    audit.schemaVersion !== 1 ||
    !Array.isArray(audit.rules) ||
    !Array.isArray(audit.files) ||
    !Array.isArray(audit.findings) ||
    !Array.isArray(audit.exceptions) ||
    !Array.isArray(audit.checks) ||
    !Array.isArray(audit.eslint?.snapshots)
  )
    return {
      errors: ['Invalid versioned audit structure.'],
      pending,
      complete: false,
    }
  require(nonempty(audit.id) &&
    ['fix', 'findings-only'].includes(audit.mode), 'Invalid audit ID or mode.')
  require(['full', 'focused'].includes(
    audit.coverage,
  ), 'Coverage must be full or focused.')
  require(audit.declaredScopeFingerprint ===
    scopeSignature(
      audit,
    ), 'Declared scope changed; initialize a new run rather than narrowing this audit.')
  require(audit.skill?.fingerprint ===
    catalog.fingerprint, 'Catalog fingerprint is stale; refresh or initialize the state.')
  const fileMap = indexed(audit.files, 'path', errors, 'file')
  const ruleMap = indexed(audit.rules, 'id', errors, 'catalog rule')
  const findings = indexed(audit.findings, 'id', errors, 'finding')
  const exceptions = indexed(audit.exceptions, 'id', errors, 'exception')
  const selected = new Set(catalog.rules.map(rule => rule.id))
  for (const id of ruleMap.keys())
    require(selected.has(id), `Unknown catalog rule: ${id}`)
  if (audit.coverage === 'full')
    for (const id of selected)
      require(ruleMap.has(id), `Missing catalog rule: ${id}`)
  const present = audit.files.filter(file => file.present)
  const fingerprint = sourceFingerprint(present)
  if (currentSources) {
    try {
      const actual = inventory(audit.scope)
      require(sourceFingerprint(actual) ===
        fingerprint, 'Source inventory changed; refresh and re-review affected code.')
    } catch (error) {
      errors.push(`Cannot verify inventory: ${error.message}`)
    }
  }
  for (const file of audit.files) {
    require(typeof file.present === 'boolean' &&
      /^[a-f0-9]{64}$/.test(file.sha256), `Invalid file snapshot: ${file.path}`)
    unfinished(
      file.review === 'reviewed' && nonempty(file.evidence),
      `File review pending: ${file.path}`,
    )
  }
  const diagnostics = new Map()
  const snapshotIds = new Set()
  for (const snapshot of audit.eslint.snapshots) {
    require(nonempty(snapshot.id) &&
      !snapshotIds.has(
        snapshot.id,
      ), `Duplicate or missing ESLint snapshot ID: ${snapshot.id}`)
    snapshotIds.add(snapshot.id)
    if (
      !Array.isArray(snapshot.diagnostics) ||
      !Array.isArray(snapshot.files)
    ) {
      errors.push(`Invalid ESLint snapshot: ${snapshot.id}`)
      continue
    }
    require(nonempty(snapshot.command) &&
      Number.isInteger(snapshot.exitCode) &&
      nonempty(
        snapshot.configFingerprint,
      ), `Incomplete ESLint provenance: ${snapshot.id}`)
    for (const diagnostic of snapshot.diagnostics) {
      require(nonempty(diagnostic.id) &&
        !diagnostics.has(
          diagnostic.id,
        ), `Duplicate or missing diagnostic ID: ${diagnostic.id}`)
      require([1, 2].includes(diagnostic.severity) &&
        typeof diagnostic.suppressed === 'boolean' &&
        nonempty(diagnostic.ruleId) &&
        nonempty(diagnostic.file) &&
        nonempty(
          diagnostic.message,
        ), `Invalid ESLint diagnostic: ${diagnostic.id}`)
      diagnostics.set(diagnostic.id, diagnostic)
    }
  }
  for (const exception of audit.exceptions) {
    require(['inline', 'configuration', 'scope'].includes(
      exception.kind,
    ), `Invalid exception kind: ${exception.id}`)
    require(['pending', 'retained', 'removed', 'invalid'].includes(
      exception.status,
    ), `Invalid exception status: ${exception.id}`)
    const reviewed =
      exception.status !== 'pending' &&
      nonempty(exception.reason) &&
      nonempty(exception.evidence) &&
      validDate(exception.reviewedAt)
    unfinished(reviewed, `Exception review pending: ${exception.id}`)
    require(nonempty(exception.location?.file) &&
      nonempty(
        exception.location?.symbol,
      ), `Missing exception location: ${exception.id}`)
    for (const id of exception.diagnosticIds ?? [])
      require(diagnostics.has(
        id,
      ), `Unknown diagnostic ${id} in exception ${exception.id}`)
    if (exception.status === 'retained' && exception.kind !== 'scope') {
      require(Array.isArray(exception.ruleIds) &&
        exception.ruleIds.length >
          0, `Missing exception rule IDs: ${exception.id}`)
      for (const ruleId of exception.ruleIds ?? [])
        unfinished(
          exception.probes?.some(
            probe =>
              probe.ruleId === ruleId &&
              probe.applicable === true &&
              nonempty(probe.diagnosticEvidence),
          ),
          `Missing underlying-diagnostic/applicability evidence: ${exception.id}/${ruleId}`,
        )
    }
    if (audit.mode === 'fix')
      unfinished(
        exception.status !== 'invalid',
        `Unjustified exception remains: ${exception.id}`,
      )
  }
  for (const excluded of audit.scope?.exclude ?? []) {
    require(nonempty(
      excluded.reason,
    ), `Missing exclusion reason: ${excluded.path}`)
    unfinished(
      audit.exceptions.some(
        exception =>
          exception.kind === 'scope' &&
          exception.location?.file === excluded.path &&
          exception.status === 'retained',
      ),
      `Exclusion not reviewed: ${excluded.path}`,
    )
  }
  const patternMap = new Map()
  const occurrenceKeys = new Set()
  for (const rule of audit.rules) {
    require(Array.isArray(
      rule.patterns,
    ), `Patterns must be an array: ${rule.id}`)
    if (!Array.isArray(rule.patterns)) continue
    const contract = catalog.rules.find(entry => entry.id === rule.id)
    require(rule.contractHash ===
      contract?.contractHash, `Rule contract changed: ${rule.id}`)
    require(['pending', 'reviewed', 'not_applicable'].includes(
      rule.review,
    ), `Invalid rule review: ${rule.id}`)
    unfinished(
      rule.review !== 'pending' &&
        rule.discovery === 'complete' &&
        nonempty(rule.unit) &&
        nonempty(rule.method) &&
        nonempty(rule.evidence),
      `Rule coverage pending: ${rule.id}`,
    )
    if (rule.review !== 'pending') {
      require(['manual', 'automatic', 'mixed'].includes(
        rule.method,
      ), `Invalid review method: ${rule.id}`)
      if (rule.method === 'automatic' || rule.method === 'mixed')
        unfinished(
          rule.automaticChecks?.length > 0,
          `Missing automatic-check proof: ${rule.id}`,
        )
    }
    if (rule.review === 'not_applicable')
      require(rule.patterns.length ===
        0, `Not-applicable rule has occurrences: ${rule.id}`)
    for (const check of rule.automaticChecks ?? []) {
      unfinished(
        nonempty(check.ruleId) &&
          [1, 2].includes(check.severity) &&
          nonempty(check.rejectedEvidence) &&
          nonempty(check.acceptedEvidence) &&
          nonempty(check.configurationEvidence) &&
          nonempty(check.limitsEvidence),
        `Automatic-check proof incomplete: ${rule.id}`,
      )
    }
    for (const pattern of rule.patterns) {
      require(nonempty(pattern.id) &&
        !patternMap.has(
          pattern.id,
        ), `Duplicate or missing pattern ID: ${pattern.id}`)
      patternMap.set(pattern.id, { ...pattern, ruleId: rule.id })
      require(RESULTS.includes(
        pattern.result,
      ), `Invalid pattern result: ${pattern.id}`)
      require(fileMap.has(pattern.location?.file) &&
        nonempty(
          pattern.location?.symbol,
        ), `Missing file or semantic locator: ${pattern.id}`)
      if (pattern.result !== 'removed') {
        const key = JSON.stringify([
          rule.id,
          pattern.location?.file,
          pattern.location?.symbol,
        ])
        require(!occurrenceKeys.has(
          key,
        ), `Duplicate semantic occurrence: ${rule.id}/${pattern.location?.file}/${pattern.location?.symbol}`)
        occurrenceKeys.add(key)
      }
      if (pattern.result !== 'removed' && pattern.result !== 'pending')
        require(fileMap.get(pattern.location?.file)?.present ===
          true, `Active pattern references a removed file: ${pattern.id}`)
      unfinished(
        pattern.result !== 'pending' && nonempty(pattern.evidence),
        `Pattern review pending: ${pattern.id}`,
      )
      const linkedFindings = (pattern.findingIds ?? []).map(id =>
        findings.get(id),
      )
      for (const id of pattern.findingIds ?? [])
        require(findings.has(
          id,
        ), `Unknown finding ${id} in pattern ${pattern.id}`)
      for (const finding of linkedFindings.filter(Boolean))
        require(finding.patternIds?.includes(
          pattern.id,
        ), `Pattern/finding links disagree: ${pattern.id}/${finding.id}`)
      if (pattern.result === 'error') {
        require(linkedFindings.some(
          finding => finding?.status === 'open',
        ), `Error pattern has no open finding: ${pattern.id}`)
        if (audit.mode === 'fix')
          pending.push(`Violation remains: ${pattern.id}`)
      }
      if (
        pattern.result === 'ok' ||
        pattern.result === 'exempt' ||
        pattern.result === 'removed'
      )
        require(!linkedFindings.some(
          finding => finding?.status === 'open',
        ), `Reviewed pattern still has an open finding: ${pattern.id}`)
      if (pattern.result === 'exempt')
        require((pattern.exceptionIds ?? []).some(
          id => exceptions.get(id)?.status === 'retained',
        ), `Exempt pattern has no retained exception: ${pattern.id}`)
      for (const id of pattern.exceptionIds ?? [])
        require(exceptions.has(
          id,
        ), `Unknown exception ${id} in pattern ${pattern.id}`)
    }
  }
  for (const finding of audit.findings) {
    require(['open', 'fixed', 'accepted'].includes(finding.status) &&
      ['error', 'warning'].includes(finding.severity) &&
      nonempty(finding.message) &&
      nonempty(finding.evidence), `Invalid finding: ${finding.id}`)
    const patternIds = finding.patternIds ?? []
    const diagnosticIds = finding.diagnosticIds ?? []
    require(patternIds.length + diagnosticIds.length >
      0, `Finding has no occurrence or diagnostic: ${finding.id}`)
    for (const id of patternIds) {
      require(patternMap.has(
        id,
      ), `Unknown pattern ${id} in finding ${finding.id}`)
      require(patternMap
        .get(id)
        ?.findingIds?.includes(
          finding.id,
        ), `Finding/pattern links disagree: ${finding.id}/${id}`)
    }
    for (const id of diagnosticIds)
      require(diagnostics.has(
        id,
      ), `Unknown diagnostic ${id} in finding ${finding.id}`)
    if (finding.status === 'fixed')
      require(nonempty(
        finding.verification,
      ), `Unverified correction: ${finding.id}`)
    if (finding.status === 'accepted')
      require(exceptions.get(finding.exceptionId)?.status ===
        'retained', `Accepted finding has no retained exception: ${finding.id}`)
    if (audit.mode === 'fix')
      unfinished(finding.status !== 'open', `Open finding: ${finding.id}`)
  }
  unfinished(
    audit.exceptionInventory?.review === 'reviewed' &&
      nonempty(audit.exceptionInventory.evidence),
    'Exception/configuration inventory is incomplete.',
  )
  unfinished(
    audit.eslint.review === 'reviewed' &&
      nonempty(audit.eslint.configurationEvidence),
    'ESLint configuration and diagnostics review is incomplete.',
  )
  for (const diagnostic of diagnostics.values()) {
    if (fileMap.has(diagnostic.file)) {
      unfinished(
        audit.findings.some(entry =>
          entry.diagnosticIds?.includes(diagnostic.id),
        ) ||
          audit.exceptions.some(entry =>
            entry.diagnosticIds?.includes(diagnostic.id),
          ),
        `Unaccounted ESLint diagnostic: ${diagnostic.id}`,
      )
    }
  }
  const latest = audit.eslint.snapshots.at(-1)
  unfinished(Boolean(latest), 'No ESLint snapshot recorded.')
  if (latest) {
    unfinished(
      latest.sourceFingerprint === fingerprint,
      'Latest ESLint snapshot predates current source.',
    )
    for (const file of present.filter(file =>
      /\.[cm]?[jt]sx?$/u.test(file.path),
    )) {
      const justifiedOmission = audit.exceptions.some(
        exception =>
          exception.kind === 'configuration' &&
          exception.status === 'retained' &&
          exception.affectedFiles?.includes(file.path),
      )
      unfinished(
        latest.files.includes(file.path) || justifiedOmission,
        `Scoped source missing from ESLint results: ${file.path}`,
      )
    }
    const currentDiagnostics = latest.diagnostics ?? []
    const warnings = currentDiagnostics.filter(
      item => !item.suppressed && item.severity === 1,
    ).length
    unfinished(
      Number.isInteger(audit.eslint.warningBudget) &&
        audit.eslint.warningBudget === warnings,
      'ESLint warning budget must equal the global warning total.',
    )
    for (const diagnostic of currentDiagnostics.filter(
      item => fileMap.get(item.file)?.present,
    )) {
      const finding = audit.findings.find(entry =>
        entry.diagnosticIds?.includes(diagnostic.id),
      )
      const exception = audit.exceptions.find(entry =>
        entry.diagnosticIds?.includes(diagnostic.id),
      )
      if (finding)
        require(finding.status !==
          'fixed', `Current ESLint diagnostic is marked fixed: ${diagnostic.id}`)
      if (exception)
        require(exception.status !==
          'removed', `Current ESLint diagnostic references a removed exception: ${diagnostic.id}`)
      if (
        audit.mode === 'fix' &&
        !diagnostic.suppressed &&
        diagnostic.severity === 2
      )
        pending.push(`ESLint error remains: ${diagnostic.id}`)
    }
    if (audit.mode === 'fix')
      unfinished(latest.exitCode === 0, 'Latest ESLint command failed.')
  }
  unfinished(
    audit.checks.length > 0,
    'Required checks have not been inventoried.',
  )
  indexed(audit.checks, 'id', errors, 'check')
  for (const check of audit.checks) {
    require(['pending', 'passed', 'failed', 'not_applicable'].includes(
      check.status,
    ), `Invalid check status: ${check.id}`)
    const recorded =
      check.status === 'passed' ||
      check.status === 'not_applicable' ||
      (audit.mode === 'findings-only' && check.status === 'failed')
    unfinished(
      recorded && nonempty(check.evidence),
      `Check not satisfied: ${check.id}`,
    )
    if (check.status === 'passed' || check.status === 'failed')
      unfinished(
        check.sourceFingerprint === fingerprint,
        `Check predates current source: ${check.id}`,
      )
  }
  return {
    errors,
    pending,
    complete: errors.length === 0 && pending.length === 0,
  }
}

export function summarizeAudit(audit) {
  const rules = audit.rules.map(rule => {
    const counts = Object.fromEntries(
      RESULTS.map(result => [
        result,
        rule.patterns.filter(pattern => pattern.result === result).length,
      ]),
    )
    const total = counts.ok + counts.error + counts.exempt + counts.pending
    return {
      id: rule.id,
      unit: rule.unit,
      review: rule.review,
      discovery: rule.discovery,
      total,
      ...counts,
    }
  })
  const snapshots = audit.eslint.snapshots.map(snapshot => ({
    id: snapshot.id,
    files: snapshot.files.length,
    exitCode: snapshot.exitCode,
    errors: snapshot.diagnostics.filter(
      item => !item.suppressed && item.severity === 2,
    ).length,
    warnings: snapshot.diagnostics.filter(
      item => !item.suppressed && item.severity === 1,
    ).length,
    suppressed: snapshot.diagnostics.filter(item => item.suppressed).length,
  }))
  return {
    rules,
    snapshots,
    sourceFingerprint: sourceFingerprint(
      audit.files.filter(file => file.present),
    ),
    files: audit.files.filter(file => file.present).length,
  }
}

export function compareAudits(previous, current) {
  const reasons = []
  if (previous.schemaVersion !== current.schemaVersion)
    reasons.push('report schema changed')
  if (scopeSignature(previous) !== scopeSignature(current))
    reasons.push('scope, exclusions or audit mode changed')
  const before = new Map(previous.rules.map(rule => [rule.id, rule]))
  const beforeSummary = new Map(
    summarizeAudit(previous).rules.map(rule => [rule.id, rule]),
  )
  const rows = summarizeAudit(current).rules.map(row => {
    const old = before.get(row.id)
    const rowReasons = [...reasons]
    if (!old) rowReasons.push('new catalog rule')
    if (
      old &&
      (!nonempty(old.unit) ||
        !nonempty(row.unit) ||
        old.review === 'pending' ||
        row.review === 'pending' ||
        old.discovery !== 'complete' ||
        row.discovery !== 'complete')
    )
      rowReasons.push('occurrence coverage is incomplete')
    if (
      old &&
      (old.unit !== row.unit ||
        old.contractHash !==
          current.rules.find(rule => rule.id === row.id).contractHash)
    )
      rowReasons.push('counting unit or rule contract changed')
    const previousPatterns = new Map(
      (old?.patterns ?? []).map(pattern => [pattern.id, pattern]),
    )
    const patterns = current.rules.find(rule => rule.id === row.id).patterns
    const currentIds = new Set(patterns.map(pattern => pattern.id))
    return {
      id: row.id,
      comparable: rowReasons.length === 0,
      reasons: rowReasons,
      before: beforeSummary.get(row.id) ?? null,
      after: row,
      added: patterns
        .filter(pattern => !previousPatterns.has(pattern.id))
        .map(pattern => pattern.id),
      absent: [...previousPatterns.keys()].filter(id => !currentIds.has(id)),
      transitions: patterns
        .filter(
          pattern =>
            previousPatterns.has(pattern.id) &&
            previousPatterns.get(pattern.id).result !== pattern.result,
        )
        .map(pattern => ({
          id: pattern.id,
          before: previousPatterns.get(pattern.id).result,
          after: pattern.result,
        })),
    }
  })
  const oldFiles = new Map(
    previous.files
      .filter(file => file.present)
      .map(file => [file.path, file.sha256]),
  )
  const newFiles = new Map(
    current.files
      .filter(file => file.present)
      .map(file => [file.path, file.sha256]),
  )
  const oldLint = previous.eslint.snapshots.at(-1)
  const newLint = current.eslint.snapshots.at(-1)
  return {
    previousId: previous.id,
    currentId: current.id,
    rows,
    retiredRules: previous.rules
      .filter(rule => !current.rules.some(entry => entry.id === rule.id))
      .map(rule => rule.id),
    files: {
      added: [...newFiles.keys()].filter(path => !oldFiles.has(path)),
      absent: [...oldFiles.keys()].filter(path => !newFiles.has(path)),
      changed: [...newFiles.keys()].filter(
        path => oldFiles.has(path) && oldFiles.get(path) !== newFiles.get(path),
      ),
    },
    eslintComparable:
      reasons.length === 0 &&
      Boolean(
        oldLint &&
        newLint &&
        lintInputsRecorded(previous, oldLint) &&
        lintInputsRecorded(current, newLint) &&
        oldLint.configFingerprint === newLint.configFingerprint &&
        oldLint.toolchainFingerprint &&
        oldLint.toolchainFingerprint === newLint.toolchainFingerprint,
      ),
  }
}

export function renderAudit(audit, validation, previous) {
  const summary = summarizeAudit(audit)
  const lines = [
    '# React audit',
    '',
    `Run: ${cell(audit.id)}. Scope: **${audit.coverage}**. Mode: **${audit.mode}**. State: **${validation.complete ? 'complete' : 'incomplete'}**.`,
    '',
    `${summary.files} current files; ${audit.files.filter(file => file.present && file.review === 'reviewed').length} reviewed. Source fingerprint: \`${summary.sourceFingerprint}\`.`,
    '',
    '## Catalog coverage',
    '',
    'Counts refer to the eligible unit defined for each rule. Found = OK + Error + Exempt + Pending. Removed occurrences are historical and excluded from Found. A pending discovery may still hide undiscovered occurrences.',
    '',
    '| Rule | Unit | Found | OK | Error | Exempt | Pending | Removed | Review / discovery |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
  ]
  for (const row of summary.rules)
    lines.push(
      `| ${cell(row.id)} | ${cell(row.unit || 'undefined')} | ${row.total} | ${row.ok} | ${row.error} | ${row.exempt} | ${row.pending} | ${row.removed} | ${row.review} / ${row.discovery} |`,
    )
  const unselected = audit.skill.rules.filter(
    rule => !audit.rules.some(entry => entry.id === rule.id),
  )
  for (const rule of unselected)
    lines.push(
      `| ${cell(rule.id)} | — | — | — | — | — | — | — | out of focused scope |`,
    )
  lines.push(
    '',
    '## ESLint diagnostics',
    '',
    'OK occurrence counts: **not measured by ESLint**. Counts below are diagnostics, not eligible nodes. Files means files with diagnostics for that rule; file-result counts are shown separately and do not prove rule applicability.',
    '',
    '| Snapshot | Files in results | Errors | Warnings | Suppressed | Exit |',
    '| --- | ---: | ---: | ---: | ---: | ---: |',
  )
  for (const row of summary.snapshots)
    lines.push(
      `| ${cell(row.id)} | ${row.files} | ${row.errors} | ${row.warnings} | ${row.suppressed} | ${row.exitCode} |`,
    )
  for (const snapshot of audit.eslint.snapshots) {
    lines.push(
      '',
      `### ${cell(snapshot.id)}`,
      '',
      '| ESLint rule | Errors | Warnings | Suppressed | Files with diagnostics | OK occurrences |',
      '| --- | ---: | ---: | ---: | ---: | --- |',
    )
    const ids = [
      ...new Set(snapshot.diagnostics.map(item => item.ruleId)),
    ].sort()
    for (const id of ids) {
      const items = snapshot.diagnostics.filter(item => item.ruleId === id)
      lines.push(
        `| ${cell(id)} | ${items.filter(item => !item.suppressed && item.severity === 2).length} | ${items.filter(item => !item.suppressed && item.severity === 1).length} | ${items.filter(item => item.suppressed).length} | ${new Set(items.map(item => item.file)).size} | not measured |`,
      )
    }
  }
  lines.push(
    '',
    '## Exhaustive findings',
    '',
    '| ID | Severity | State | Patterns / diagnostics | Problem | Evidence / verification |',
    '| --- | --- | --- | --- | --- | --- |',
  )
  for (const finding of audit.findings)
    lines.push(
      `| ${cell(finding.id)} | ${finding.severity} | ${finding.status} | ${cell([...(finding.patternIds ?? []), ...(finding.diagnosticIds ?? [])].join(', '))} | ${cell(finding.message)} | ${cell([finding.evidence, finding.verification].filter(Boolean).join('; '))} |`,
    )
  lines.push(
    '',
    '## Exhaustive ESLint diagnostic list',
    '',
    '| ID | Snapshot | Rule | Severity | Suppressed | Location | Diagnostic |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  )
  for (const snapshot of audit.eslint.snapshots)
    for (const item of snapshot.diagnostics)
      lines.push(
        `| ${cell(item.id)} | ${cell(snapshot.id)} | ${cell(item.ruleId)} | ${item.severity === 2 ? 'error' : 'warning'} | ${item.suppressed ? 'yes' : 'no'} | ${cell(`${item.file}:${item.line ?? '?'}:${item.column ?? '?'}`)} | ${cell(item.message)} |`,
      )
  lines.push(
    '',
    '## Exception decisions',
    '',
    '| ID | Kind | State | Location | Reason / evidence |',
    '| --- | --- | --- | --- | --- |',
  )
  for (const exception of audit.exceptions)
    lines.push(
      `| ${cell(exception.id)} | ${exception.kind} | ${exception.status} | ${cell(exception.location?.file)} | ${cell([exception.reason, exception.evidence, exception.unmaskedEvidence].filter(Boolean).join('; '))} |`,
    )
  lines.push(
    '',
    '## Verification checks',
    '',
    '| Check | Actual result | Evidence |',
    '| --- | --- | --- |',
  )
  for (const check of audit.checks)
    lines.push(
      `| ${cell(check.id)} | ${check.status} | ${cell(check.evidence)} |`,
    )
  if (previous) {
    const comparison = compareAudits(previous, audit)
    lines.push(
      '',
      '## Previous run comparison',
      '',
      `Previous run: ${cell(previous.id)}. Files: ${comparison.files.added.length} added, ${comparison.files.absent.length} absent, ${comparison.files.changed.length} changed. ESLint context comparable: ${comparison.eslintComparable ? 'yes' : 'no / not established'}.`,
      '',
      '| Rule | Comparable | Found before → after | Errors before → after | Added IDs | Absent IDs | Result transitions | Context changes |',
      '| --- | --- | --- | --- | --- | --- | --- | --- |',
    )
    for (const row of comparison.rows)
      lines.push(
        `| ${cell(row.id)} | ${row.comparable ? 'yes' : 'no'} | ${row.before?.total ?? '—'} → ${row.after.total} | ${row.before?.error ?? '—'} → ${row.after.error} | ${cell(row.added.join(', '))} | ${cell(row.absent.join(', '))} | ${cell(row.transitions.map(item => `${item.id}: ${item.before} → ${item.after}`).join('; '))} | ${cell(row.reasons.join('; '))} |`,
      )
    lines.push(
      '',
      'Absent IDs and smaller totals are not automatically classified as corrected. Explain additions, removals, reclassifications and changed context in the evidence; keep semantic IDs across moves.',
      '',
    )
  }
  lines.push('', '## Outstanding work', '')
  for (const message of [...validation.errors, ...validation.pending])
    lines.push(`- ${cell(message)}`)
  if (validation.complete)
    lines.push(
      'No bookkeeping or completion gaps detected. Review evidence still requires human/agent judgment.',
    )
  return `${lines.join('\n')}\n`
}

function projectPath(root, input) {
  if (!nonempty(input)) throw new Error('Paths must be nonempty.')
  const path = relative(resolve(root), resolve(root, input))
  if (path === '..' || path.startsWith(`..${sep}`) || isAbsolute(path))
    throw new Error(`Path leaves project root: ${input}`)
  return path.split(sep).join('/') || '.'
}

function contains(parent, path) {
  return parent === '.' || parent === path || path.startsWith(`${parent}/`)
}
function sourceFingerprint(files) {
  return jsonHash(
    files
      .map(file => [file.path, file.sha256])
      .sort(([a], [b]) => a.localeCompare(b, 'en')),
  )
}
function scopeSignature(audit) {
  return jsonHash([
    audit.coverage,
    audit.mode,
    [...audit.scope.include].sort(),
    [...audit.scope.exclude].sort((a, b) => a.path.localeCompare(b.path)),
    audit.rules.map(rule => rule.id).sort(),
  ])
}
function lintInputsRecorded(audit, snapshot) {
  const files = audit.files.filter(file => file.present)
  if (
    audit.eslint.review !== 'reviewed' ||
    !nonempty(audit.eslint.configurationEvidence) ||
    snapshot.sourceFingerprint !== sourceFingerprint(files)
  )
    return false
  return files
    .filter(file => /\.[cm]?[jt]sx?$/u.test(file.path))
    .every(
      file =>
        snapshot.files.includes(file.path) ||
        audit.exceptions.some(
          exception =>
            exception.kind === 'configuration' &&
            exception.status === 'retained' &&
            exception.affectedFiles?.includes(file.path),
        ),
    )
}
function cell(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replace(/\r?\n/g, ' ')
}
function validDate(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().startsWith(value)
  )
}
function indexed(entries, key, errors, label) {
  const map = new Map()
  for (const entry of entries) {
    if (!nonempty(entry?.[key]) || map.has(entry[key]))
      errors.push(`Duplicate or missing ${label}: ${entry?.[key]}`)
    else map.set(entry[key], entry)
  }
  return map
}

function main(args) {
  const command = args.shift()
  const allowed = {
    init: ['--root', '--scope', '--exclude', '--mode', '--rules', '--out'],
    refresh: ['--audit'],
    eslint: [
      '--audit',
      '--report',
      '--label',
      '--command',
      '--exit-code',
      '--config',
      '--tooling',
    ],
    check: ['--audit', '--complete'],
    render: ['--audit', '--out', '--previous'],
  }
  if (!allowed[command])
    throw new Error(
      'Use init, refresh, eslint, check or render; see references/audit-report.md.',
    )
  const options = new Map()
  while (args.length) {
    const key = args.shift()
    if (!allowed[command].includes(key))
      throw new Error(`Unknown ${command} option: ${key}`)
    if (
      options.has(key) &&
      !['--scope', '--exclude', '--config', '--tooling'].includes(key)
    )
      throw new Error(`Duplicate option: ${key}`)
    const value = key === '--complete' ? true : args.shift()
    if (value == null || (typeof value === 'string' && value.startsWith('--')))
      throw new Error(`Missing value: ${key}`)
    options.set(key, [...(options.get(key) ?? []), value])
  }
  const one = key => options.get(key)?.at(-1)
  const many = key => options.get(key) ?? []
  const read = path => JSON.parse(readFileSync(path, 'utf8'))
  const write = (path, state) =>
    writeFileSync(path, `${JSON.stringify(state, null, 2)}\n`)
  const checkOutput = (scope, output) => {
    let path
    try {
      path = projectPath(scope.root, resolve(output))
    } catch {
      return
    }
    if (
      scope.include.some(entry => contains(entry, path)) &&
      !scope.exclude.some(entry => contains(entry.path, path))
    )
      throw new Error(
        'Audit outputs must be outside the inspected source paths.',
      )
  }
  if (command === 'init') {
    const state = createAudit({
      root: one('--root'),
      include: many('--scope'),
      mode: one('--mode') ?? 'fix',
      selectedRules: one('--rules')?.split(','),
      exclude: many('--exclude').map(value => {
        const separator = value.indexOf('=')
        return {
          path: value.slice(0, separator),
          reason: separator < 0 ? '' : value.slice(separator + 1),
        }
      }),
    })
    if (existsSync(one('--out')))
      throw new Error(
        'Audit state already exists; retain it and choose a new run path.',
      )
    checkOutput(state.scope, one('--out'))
    writeFileSync(one('--out'), `${JSON.stringify(state, null, 2)}\n`, {
      flag: 'wx',
    })
    console.log(
      `Initialized ${state.rules.length} rules and ${state.files.length} files; all reviews are pending.`,
    )
    return
  }
  const path = one('--audit')
  const state = read(path)
  if (command === 'refresh') {
    const changed = refreshAudit(state)
    write(path, state)
    console.log(
      JSON.stringify({
        changed,
        sourceFingerprint: summarizeAudit(state).sourceFingerprint,
      }),
    )
  } else if (command === 'eslint') {
    const snapshot = addEslintSnapshot(state, read(one('--report')), {
      id: one('--label'),
      command: one('--command'),
      exitCode: Number(one('--exit-code')),
      configuration: many('--config'),
      tooling: many('--tooling'),
    })
    write(path, state)
    console.log(
      `Imported ${snapshot.diagnostics.length} diagnostics from ${snapshot.files.length} files.`,
    )
  } else if (command === 'check' || command === 'render') {
    const validation = validateAudit(state)
    if (command === 'render') {
      if (validation.errors.length)
        throw new Error(validation.errors.join('\n'))
      if (
        [path, one('--previous')]
          .filter(Boolean)
          .some(input => resolve(input) === resolve(one('--out')))
      )
        throw new Error(
          'Rendered output must not overwrite audit state or previous-run evidence.',
        )
      checkOutput(state.scope, one('--out'))
      writeFileSync(
        one('--out'),
        renderAudit(
          state,
          validation,
          one('--previous') ? read(one('--previous')) : undefined,
        ),
      )
      console.log(
        `Rendered ${state.rules.length} reviewed-scope rows; state is ${validation.complete ? 'complete' : 'incomplete'}.`,
      )
    } else {
      console.log(JSON.stringify(validation, null, 2))
      if (
        validation.errors.length ||
        (one('--complete') && !validation.complete)
      )
        process.exitCode = 1
    }
  } else
    throw new Error(
      'Use init, refresh, eslint, check or render; see references/audit-report.md.',
    )
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main(process.argv.slice(2))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
