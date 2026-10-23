import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

const root = new URL('..', import.meta.url).pathname
const sourceRoot = join(root, 'src')
const catalog = JSON.parse(readFileSync(join(sourceRoot, 'i18n', 'locales', 'en.json'), 'utf8'))
const usedKeys = new Set()

function visitSourceFile(path) {
  const sourceFile = ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  const visit = (node) => {
    if (ts.isCallExpression(node)
      && ts.isPropertyAccessExpression(node.expression)
      && node.expression.expression.getText(sourceFile) === 'i18n'
      && node.expression.name.text === 't'
      && node.arguments[0]
      && ts.isStringLiteral(node.arguments[0])) {
      usedKeys.add(node.arguments[0].text)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
}

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry)
    if (statSync(path).isDirectory()) walk(path)
    else if (/\.tsx?$/.test(path)) visitSourceFile(path)
  }
}

walk(sourceRoot)

const unusedKeys = Object.keys(catalog).filter((key) => {
  const pluralBase = key.replace(/_(?:one|other)$/, '')
  return !usedKeys.has(key) && !usedKeys.has(pluralBase)
})

if (unusedKeys.length > 0) {
  console.error(`Unused i18n catalog keys:\n${unusedKeys.join('\n')}`)
  process.exitCode = 1
}
