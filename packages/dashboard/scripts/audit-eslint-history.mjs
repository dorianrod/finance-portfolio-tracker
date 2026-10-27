import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Analyze complete historical trees. lintText against today's imports would mix revisions.
const dashboard = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repository = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  cwd: dashboard,
  encoding: 'utf8',
}).trim()
const revisions = ['6cfcfbb', 'f9709dd', 'a436b40', '7898902', '5b5ca5d']
const outputIndex = process.argv.indexOf('--output')
const output = outputIndex < 0 ? null : resolve(process.argv[outputIndex + 1])
const temporary = mkdtempSync(join(tmpdir(), 'finance-eslint-history-'))
const results = []
let originalBaseline
const tooling = join(temporary, 'tooling')
mkdirSync(tooling)
cpSync(join(dashboard, 'eslint-rules'), join(tooling, 'eslint-rules'), {
  recursive: true,
})
cpSync(join(dashboard, 'eslint.config.js'), join(tooling, 'eslint.config.js'))
cpSync(
  join(dashboard, 'scripts/eslint-project-fingerprint.mjs'),
  join(tooling, 'eslint-project-fingerprint.mjs'),
)
const ruleHash = createHash('sha256')
for (const name of readdirSync(join(tooling, 'eslint-rules'))
  .filter((name) => name.endsWith('.js') && !name.endsWith('.test.js'))
  .sort())
  ruleHash
    .update(name)
    .update(readFileSync(join(tooling, 'eslint-rules', name)))
ruleHash.update(readFileSync(join(tooling, 'eslint.config.js')))

function lintTree(snapshot, diagnosticsFile) {
  const run = spawnSync(
    process.execPath,
    [
      join(dashboard, 'node_modules/eslint/bin/eslint.js'),
      'src',
      '--no-cache',
      '--format',
      'json',
      '--output-file',
      diagnosticsFile,
    ],
    { cwd: snapshot, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 },
  )
  if (run.error || ![0, 1].includes(run.status))
    throw new Error(
      run.error?.message ?? run.stderr ?? `ESLint exited ${run.status}`,
    )
  const files = JSON.parse(readFileSync(diagnosticsFile, 'utf8'))
  const diagnostics = files.flatMap((file) =>
    file.messages.map((message) => ({
      file: file.filePath.slice(snapshot.length + 1),
      ...message,
    })),
  )
  const fatal = diagnostics.filter((message) => message.fatal)
  if (fatal.length)
    throw new Error(
      `Historical snapshot ${snapshot} has parser failures: ${JSON.stringify(fatal)}`,
    )
  const byRule = {}
  for (const message of diagnostics)
    byRule[message.ruleId ?? 'configuration'] =
      (byRule[message.ruleId ?? 'configuration'] ?? 0) + 1
  const findings = diagnostics.map(
    ({
      file,
      line,
      endLine,
      column,
      ruleId,
      messageId,
      message,
      severity,
    }) => ({
      file,
      line,
      endLine,
      column,
      ruleId,
      messageId,
      message,
      severity,
    }),
  )
  return {
    fileCount: files.length,
    diagnosticCount: diagnostics.length,
    affectedFileCount: new Set(diagnostics.map((message) => message.file)).size,
    byRule,
    findings,
  }
}

try {
  for (const revision of revisions) {
    process.stdout.write(
      `Linting historical tree ${revision} with current rules…\n`,
    )
    const destination = join(temporary, revision)
    const archive = join(temporary, `${revision}.tar`)
    execFileSync(
      'git',
      ['archive', '--output', archive, revision, 'packages/dashboard'],
      { cwd: repository },
    )
    // tar creates the package hierarchy under this fresh directory.
    mkdirSync(destination, { recursive: true })
    execFileSync('tar', ['-xf', archive, '-C', destination])
    const snapshot = join(destination, 'packages/dashboard')
    symlinkSync(
      join(dashboard, 'node_modules'),
      join(snapshot, 'node_modules'),
      'dir',
    )
    if (revision === revisions[0]) {
      originalBaseline = lintTree(
        snapshot,
        join(destination, 'original-diagnostics.json'),
      )
      process.stdout.write(
        `${revision} with its original rules: ${originalBaseline.diagnosticCount} diagnostics\n`,
      )
    }
    cpSync(join(tooling, 'eslint-rules'), join(snapshot, 'eslint-rules'), {
      recursive: true,
    })
    cpSync(
      join(tooling, 'eslint.config.js'),
      join(snapshot, 'eslint.config.js'),
    )
    cpSync(
      join(tooling, 'eslint-project-fingerprint.mjs'),
      join(snapshot, 'scripts/eslint-project-fingerprint.mjs'),
    )
    const analysis = lintTree(snapshot, join(destination, 'diagnostics.json'))
    results.push({
      revision,
      hash: execFileSync('git', ['rev-parse', revision], {
        cwd: repository,
        encoding: 'utf8',
      }).trim(),
      ...analysis,
    })
    process.stdout.write(
      `${revision}: ${analysis.diagnosticCount} diagnostics in ${analysis.affectedFileCount} files\n`,
    )
  }
  const result = {
    ruleFingerprint: ruleHash.digest('hex'),
    originalBaseline,
    method:
      'Historical sources and catalogs are unchanged; only the current ESLint config, rules and fingerprint script are injected. Every snapshot uses the same installed dependency versions. No autofix is applied. Tests are linted but not executed.',
    dependencyVersions: Object.fromEntries(
      ['eslint', 'typescript', 'typescript-eslint'].map((name) => [
        name,
        JSON.parse(
          readFileSync(
            join(dashboard, 'node_modules', name, 'package.json'),
            'utf8',
          ),
        ).version,
      ]),
    ),
    results,
  }
  if (output) writeFileSync(output, JSON.stringify(result, null, 2) + '\n')
  else
    process.stdout.write(
      JSON.stringify(
        {
          ...result,
          results: results.map(({ findings, ...summary }) => summary),
        },
        null,
        2,
      ) + '\n',
    )
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
