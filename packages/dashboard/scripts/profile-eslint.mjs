import { relative } from 'node:path'
import { performance } from 'node:perf_hooks'

const start = performance.now()
const { ESLint } = await import('eslint')
const eslint = new ESLint({ stats: true, cache: false })
const results = await eslint.lintFiles(
  process.argv.slice(2).length ? process.argv.slice(2) : ['.'],
)
const elapsed = performance.now() - start
const rules = new Map()
let parse = 0
let lint = 0
let fix = 0
let errors = 0
let warnings = 0

for (const result of results) {
  errors += result.errorCount
  warnings += result.warningCount
  for (const pass of result.stats?.times.passes ?? []) {
    parse += pass.parse?.total ?? 0
    fix += pass.fix?.total ?? 0
    for (const [name, timing] of Object.entries(pass.rules ?? {})) {
      rules.set(name, (rules.get(name) ?? 0) + timing.total)
      lint += timing.total
    }
  }
}

const seconds = (milliseconds) => `${(milliseconds / 1000).toFixed(2)} s`
console.log(`${results.length} files; ${errors} errors; ${warnings} warnings`)
console.log(`Wall time: ${seconds(elapsed)}`)
console.log(`Parsing / TypeScript programs: ${seconds(parse)}`)
console.log(`Rule execution: ${seconds(lint)}; fixes: ${seconds(fix)}`)
console.log(
  '\nSlowest rules (including shared TypeScript / React initialization):',
)
for (const [name, time] of [...rules].sort((a, b) => b[1] - a[1]).slice(0, 15))
  console.log(`${seconds(time).padStart(9)}  ${name}`)

console.log('\nSlowest files (parsing and rules):')
const fileTime = (result) =>
  (result.stats?.times.passes ?? []).reduce(
    (total, pass) => total + pass.total,
    0,
  )
for (const result of [...results]
  .sort((a, b) => fileTime(b) - fileTime(a))
  .slice(0, 10))
  console.log(
    `${seconds(fileTime(result)).padStart(9)}  ${relative(process.cwd(), result.filePath)}`,
  )

if (errors) process.exitCode = 1
