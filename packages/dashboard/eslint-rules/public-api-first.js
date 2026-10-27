import { getPublicExports } from './get-public-exports.js'

const FUNCTION_TYPES = new Set([
  'FunctionDeclaration',
  'TSDeclareFunction',
  'FunctionExpression',
  'ArrowFunctionExpression',
])
const TYPE_DECLARATIONS = new Set([
  'TSTypeAliasDeclaration',
  'TSInterfaceDeclaration',
])
const EXPRESSION_WRAPPERS = new Set([
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSNonNullExpression',
  'TSTypeAssertion',
  'TSInstantiationExpression',
])

function unwrap(node) {
  while (EXPRESSION_WRAPPERS.has(node?.type)) node = node.expression
  return node
}

function isCallable(node) {
  node = unwrap(node)
  if (node?.type === 'ClassDeclaration' || node?.type === 'ClassExpression')
    return true
  if (FUNCTION_TYPES.has(node?.type)) return true
  if (node?.type !== 'CallExpression') return false
  const callee = node.callee
  const name =
    callee.type === 'Identifier'
      ? callee.name
      : callee.type === 'MemberExpression' && !callee.computed
        ? callee.property.name
        : undefined
  return ['memo', 'forwardRef'].includes(name)
}

function topLevelStatement(node) {
  while (node.parent && node.parent.type !== 'Program') node = node.parent
  return node
}

function callableStatements(declarations) {
  return declarations
    .filter((node) =>
      isCallable(node.type === 'VariableDeclarator' ? node.init : node),
    )
    .map(topLevelStatement)
}

function isErasedOrHoisted(statement) {
  if (statement.type === 'EmptyStatement') return true
  if (statement.type === 'ExportNamedDeclaration') {
    if (statement.exportKind === 'type') return true
    statement = statement.declaration
  } else if (statement.type === 'ExportDefaultDeclaration') {
    statement = statement.declaration
  }
  return (
    TYPE_DECLARATIONS.has(statement?.type) ||
    ['FunctionDeclaration', 'TSDeclareFunction'].includes(statement?.type)
  )
}

function attachedStart(node, sourceCode) {
  let start = node.range[0]
  let line = node.loc.start.line
  const previous = node.parent.body[node.parent.body.indexOf(node) - 1]
  // Keep the file header in place; do not steal the previous statement's comment.
  if (!previous) return start
  for (const comment of sourceCode.getCommentsBefore(node).reverse()) {
    if (
      line - comment.loc.end.line > 1 ||
      comment.loc.start.line <= previous.loc.end.line ||
      /@license|copyright/iu.test(comment.value)
    )
      break
    start = comment.range[0]
    line = comment.loc.start.line
  }
  return start
}

function moveFix(context, statements, anchor, program) {
  const sourceCode = context.sourceCode
  const indices = statements.map((statement) => program.body.indexOf(statement))
  const first = Math.min(...indices)
  const last = Math.max(...indices)
  // Overload groups must remain contiguous and variable declarations indivisible.
  if (last - first + 1 !== statements.length) return null
  const declaration = program.body[first].declaration ?? program.body[first]
  if (
    declaration.type === 'VariableDeclaration' &&
    declaration.declarations.length !== 1
  )
    return null
  const hoisted = ['FunctionDeclaration', 'TSDeclareFunction'].includes(
    declaration.type,
  )
  const crossed = program.body.slice(program.body.indexOf(anchor), first)
  if (!hoisted && !crossed.every(isErasedOrHoisted)) return null

  const start = attachedStart(anchor, sourceCode)
  const moveStart = attachedStart(program.body[first], sourceCode)
  let end = program.body[last].range[1]
  for (const comment of sourceCode.getCommentsAfter(program.body[last])) {
    if (comment.loc.start.line !== program.body[last].loc.end.line) break
    end = comment.range[1]
  }
  // Moving a suppression could change which code it applies to.
  if (
    sourceCode
      .getAllComments()
      .some(
        (comment) =>
          comment.range[0] >= start &&
          comment.range[0] <= end &&
          /eslint-(?:disable|enable)/u.test(comment.value),
      )
  )
    return null
  return (fixer) =>
    fixer.replaceTextRange(
      [start, end],
      `${sourceCode.text.slice(moveStart, end)}\n\n${sourceCode.text.slice(start, moveStart).trimEnd()}`,
    )
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Place public functions and components before private declarations',
    },
    fixable: 'code',
    schema: [],
    messages: {
      first:
        'Place the exported function or component after imports and module directives, before types, constants and private declarations. Automatic moves are offered only when initialization order is preserved. [quality-public-api-first]',
    },
  },
  create(context) {
    return {
      'Program:exit'(program) {
        const groups = []
        const seen = new Set()
        for (const { declarations } of getPublicExports(
          program,
          context.sourceCode,
        )) {
          const statements = [...new Set(callableStatements(declarations))]
          if (!statements.length || seen.has(statements[0])) continue
          statements.sort((a, b) => a.range[0] - b.range[0])
          groups.push(statements)
          statements.forEach((statement) => seen.add(statement))
        }
        const lastImport = program.body.findLastIndex(
          (node) => node.type === 'ImportDeclaration',
        )
        const anchor = program.body.find(
          (node, index) =>
            index > lastImport && !node.directive && !seen.has(node),
        )
        if (!anchor) return
        for (const statements of groups) {
          if (statements[0].range[0] < anchor.range[0]) continue
          context.report({
            node: statements[0],
            messageId: 'first',
            fix: moveFix(context, statements, anchor, program),
          })
        }
      },
    }
  },
}
