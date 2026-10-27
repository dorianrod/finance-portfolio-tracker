import { dirname, resolve } from 'node:path'

import {
  childrenOf,
  findVariable,
  importedBinding,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'
import { isFunctionNode } from './react-component-utils.js'

const CONTEXT_HOOKS = new Map([
  ['useTranslation', 'react-i18next'],
  ['useNavigate', 'react-router'],
  ['useQueryClient', '@tanstack/react-query'],
  ['useStore', 'jotai'],
])

export function createContextResolver(sourceCode, filename) {
  function hook(node, seen = new Set()) {
    node = unwrap(node)
    if (!node || seen.has(node)) return null
    seen.add(node)
    const binding = importedBinding(sourceCode, node)
    if (binding) {
      if (
        /\/helpers\/formatters\//u.test(
          binding.source.startsWith('.')
            ? resolve(dirname(filename), binding.source)
            : binding.source,
        ) &&
        /^use\w*Format\w*$/u.test(binding.name)
      )
        return binding.name
      const library = CONTEXT_HOOKS.get(binding.name)
      if (
        library &&
        (binding.source === library ||
          binding.source.startsWith(`${library}/`) ||
          (library === 'react-router' && binding.source === 'react-router-dom'))
      )
        return binding.name
    }
    if (node.type === 'MemberExpression') {
      const namespace = importedBinding(sourceCode, node.object)
      const name = node.computed ? node.property.value : node.property.name
      if (
        namespace?.name === '*' &&
        /\/helpers\/formatters\//u.test(
          namespace.source.startsWith('.')
            ? resolve(dirname(filename), namespace.source)
            : namespace.source,
        ) &&
        /^use\w*Format\w*$/u.test(name ?? '')
      )
        return name
      if (
        namespace?.name === '*' &&
        CONTEXT_HOOKS.get(name) === namespace.source
      )
        return name
    }
    return hook(stableInitializer(sourceCode, node), seen)
  }

  function contextValue(input, seen = new Set()) {
    const node = unwrap(input)
    if (!node || seen.has(node)) return false
    seen.add(node)
    if (isFunctionNode(node)) {
      function capturesContext(current) {
        if (
          current.type === 'CallExpression' &&
          contextValue(current.callee, seen)
        )
          return true
        return childrenOf(sourceCode, current).some(capturesContext)
      }
      return capturesContext(node.body)
    }
    if (node.type === 'CallExpression') return !!hook(node.callee)
    const binding = importedBinding(sourceCode, node)
    if (
      binding?.name === 'default' &&
      /(?:^|\/)i18n(?:\.[cm]?[jt]s)?$/u.test(binding.source)
    )
      return true
    if (node.type === 'MemberExpression') return contextValue(node.object, seen)
    if (node.type === 'ObjectExpression')
      return node.properties.some((property) =>
        contextValue(
          property.type === 'SpreadElement'
            ? property.argument
            : property.value,
          seen,
        ),
      )
    const definition = findVariable(sourceCode, node)?.defs[0]
    if (
      definition?.type === 'Variable' &&
      definition.node.id.type === 'ObjectPattern'
    ) {
      const init = unwrap(definition.node.init)
      if (init?.type === 'CallExpression') {
        const origin = hook(init.callee)
        // useTranslation also supplies data such as ready; only t/i18n are context dependencies.
        if (origin === 'useTranslation')
          return definition.node.id.properties.some(
            (property) =>
              property.type === 'Property' &&
              ['t', 'i18n'].includes(property.key.name) &&
              property.value === definition.name,
          )
        if (origin) return true
      }
    }
    return contextValue(stableInitializer(sourceCode, node), seen)
  }

  function helperCall(input, seen = new Set()) {
    const node = unwrap(input)
    if (!node || seen.has(node)) return false
    seen.add(node)
    const binding = importedBinding(
      sourceCode,
      node.type === 'MemberExpression' ? node.object : node,
    )
    if (!binding) return helperCall(stableInitializer(sourceCode, node), seen)
    const target = binding.source.startsWith('.')
      ? resolve(dirname(filename), binding.source)
      : binding.source
    return /(?:^|\/)helpers\//u.test(target)
  }

  function contextType(node) {
    if (!node) return false
    if (node.type === 'TSTypeQuery' && hook(node.exprName)) return true
    if (node.type === 'TSTypeReference') {
      const binding = importedBinding(sourceCode, node.typeName)
      if (
        binding &&
        ((binding.name === 'TFunction' && binding.source === 'i18next') ||
          (binding.name === 'NavigateFunction' &&
            binding.source.startsWith('react-router')) ||
          (binding.name === 'QueryClient' &&
            binding.source === '@tanstack/react-query') ||
          (binding.name === 'Store' && binding.source.startsWith('jotai')))
      )
        return true
    }
    return childrenOf(sourceCode, node).some(contextType)
  }

  return { contextValue, contextType, helperCall, hook }
}
