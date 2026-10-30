import { basename } from 'node:path'

import {
  findVariable,
  isProductionSource,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'
import { businessScopes } from './business-ownership.js'
import { getPublicExports } from './get-public-exports.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep helpers categorized and name their modules after their public callable export',
    },
    schema: [],
    messages: {
      category:
        'Place helpers in a documented helpers/<category>/ folder; "{{category}}" is not a helper category. [helpers-categories]',
      name: 'Name the helper file after its public callable export "{{name}}". Coordinate the rename with its callers. [helpers-categories]',
      logic:
        'Replace the .logic suffix with the helper’s public name and choose its category by responsibility. [arch-component-module-boundaries]',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/')
    if (!isProductionSource(filename) || /\.d\.[cm]?ts$/u.test(filename))
      return {}
    const relative = filename.match(/(?:^|\/)src\/(.+)$/u)?.[1]
    if (!relative) return {}
    const owner = businessScopes(relative).at(-1)
    const roles = owner ? relative.slice(owner.length + 1) : relative
    if (roles.includes('/mocks/') || roles.startsWith('mocks/')) return {}
    const marker = /(?:^|\/)helpers\//u.exec(roles)
    if (!marker) return {}
    const helperPath = roles.slice(marker.index + marker[0].length)
    const segments = helperPath.split('/')
    const category = segments.length > 1 ? segments[0] : '(flat helpers folder)'
    const stem = basename(filename).replace(/\.[cm]?[jt]sx?$/u, '')
    return {
      'Program:exit'(program) {
        if (!CATEGORIES.has(category))
          context.report({
            node: program,
            messageId: 'category',
            data: { category },
          })
        if (stem.endsWith('.logic')) {
          context.report({ node: program, messageId: 'logic' })
          return
        }
        for (const entry of getPublicExports(program, context.sourceCode)) {
          const declaration = entry.declarations.find((node) =>
            isCallable(node, context.sourceCode),
          )
          if (!declaration) continue
          const name =
            entry.name === 'default' ? declaration.id?.name : entry.name
          if (name && name !== stem)
            context.report({
              node: entry.node,
              messageId: 'name',
              data: { name },
            })
        }
      },
    }
  },
}

const CATEGORIES = new Set([
  'businessRules',
  'formatters',
  'selectors',
  'aggregators',
  'calculators',
  'mappers',
  'presenters',
  'quality',
  'validators',
  'payloads',
  'forms',
  'filters',
  'schemas',
  'links',
])

function isCallable(node, sourceCode, seen = new Set()) {
  node = unwrap(node)
  if (!node || seen.has(node)) return false
  seen.add(node)
  if (
    [
      'FunctionDeclaration',
      'TSDeclareFunction',
      'FunctionExpression',
      'ArrowFunctionExpression',
    ].includes(node.type)
  )
    return true
  if (node.type === 'VariableDeclarator')
    return isCallable(node.init, sourceCode, seen)
  if (node.type !== 'Identifier') return false
  const initializer = stableInitializer(sourceCode, node)
  if (initializer) return isCallable(initializer, sourceCode, seen)
  const definition = findVariable(sourceCode, node)?.defs[0]
  return (
    definition?.type === 'FunctionName' &&
    isCallable(definition.node, sourceCode, seen)
  )
}
