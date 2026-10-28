import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const require = createRequire(new URL('../../../packages/dashboard/package.json', import.meta.url))
const { ESLint } = require('eslint')
const root = resolve(import.meta.dirname, '../../..')
const output = resolve(import.meta.dirname, 'exception-probes.json')
const initial = JSON.parse(readFileSync(new URL('./lint-before.json', import.meta.url), 'utf8'))
const eslint = new ESLint({ cwd: resolve(root, 'packages/dashboard'), cache: false })
const probes = []
for (const file of initial) {
  const directives = file.messages.filter(message => message.ruleId === 'local/reviewed-eslint-suppression')
  if (!directives.length) continue
  const original = readFileSync(file.filePath, 'utf8')
  for (const directive of directives) {
    const lines = original.split('\n')
    const text = lines[directive.line - 1]
    const namedRules = text.match(/eslint-disable-(?:next-line|line)\s+(.+?)\s+--/)[1].split(',').map(value => value.trim())
    // Remove this directive only and preserve all source line numbers.
    lines[directive.line - 1] = text.replace(/eslint-disable-(?:next-line|line)/, 'audit-unmasked')
    const [unmasked] = await eslint.lintText(lines.join('\n'), { filePath: file.filePath })
    probes.push({ file: file.filePath.slice(root.length + 1), line: directive.line, text, namedRules, diagnostics: unmasked.messages.filter(message => namedRules.includes(message.ruleId)), fatalErrorCount: unmasked.fatalErrorCount })
    writeFileSync(output, `${JSON.stringify(probes, null, 2)}\n`)
  }
  process.stdout.write(`${file.filePath.slice(root.length + 1)}: ${directives.length} probes\n`)
}
process.stdout.write(`Completed ${probes.length} isolated suppression probes\n`)
