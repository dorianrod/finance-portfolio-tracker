import {
  childrenOf,
  findVariable,
  importedBinding,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'
import { getPublicExports } from './get-public-exports.js'
import { libraryBinding } from './library-binding.js'
import { getFunctionComponentName } from './react-component-utils.js'
import { createTranslationResolver } from './translation-bindings.js'

export const BUSINESS_PATH_SEGMENTS = [
  '/apis/',
  '/services/',
  '/stores/',
  '/helpers/businessRules/',
  '/helpers/calculators/',
  '/helpers/filters/',
  '/helpers/mappers/',
  '/helpers/quality/',
  '/helpers/validators/',
]

export function businessSource(source) {
  return (
    ['jotai', '@tanstack/react-query'].some(
      (module) => source === module || source.startsWith(`${module}/`),
    ) || BUSINESS_PATH_SEGMENTS.some((segment) => source.includes(segment))
  )
}

function visualSource(source) {
  return (
    ['react', 'react-i18next', 'recharts'].includes(source) ||
    /(?:^|\/)(?:shared\/ui|helpers\/(?:formatters|presenters))(?:\/|$)/u.test(
      source,
    ) ||
    source.includes('.view')
  )
}

// Opaque calls are review candidates, never proof that business behavior is absent.
export function analyzeComponentRoles(sourceCode, program) {
  const components = []
  const translate = createTranslationResolver(sourceCode)
  function booleanConversion(input, seen = new Set()) {
    const node = unwrap(input)
    if (!node || seen.has(node)) return false
    seen.add(node)
    if (
      node.type === 'Identifier' &&
      node.name === 'Boolean' &&
      !findVariable(sourceCode, node)?.defs.length
    )
      return true
    return booleanConversion(stableInitializer(sourceCode, node), seen)
  }
  function collect(node) {
    const name = getFunctionComponentName(node, sourceCode)
    if (name)
      components.push({
        node,
        name,
        business: new Set(),
        opaque: new Set(),
        local: new Set(),
        elements: 0,
      })
    for (const child of childrenOf(sourceCode, node)) collect(child)
  }
  collect(program)
  const componentNodes = new Set(components.map(({ node }) => node))
  function origin(node, seen = new Set()) {
    node = unwrap(node)
    if (!node || seen.has(node)) return null
    seen.add(node)
    if (node.type === 'MemberExpression') return origin(node.object, seen)
    if (node.type === 'CallExpression') return origin(node.callee, seen)
    if (node.type !== 'Identifier') return null
    const imported = importedBinding(sourceCode, node)
    if (imported) return imported
    const variable = findVariable(sourceCode, node)
    if (
      variable?.references.some(
        (reference) => reference.isWrite() && !reference.init,
      )
    )
      return null
    const definition = variable?.defs[0]
    return definition?.type === 'Variable'
      ? origin(definition.node.init, seen)
      : null
  }
  for (const component of components) {
    function invocation(node) {
      if (
        translate(node) ||
        (node.type === 'CallExpression' && booleanConversion(node.callee))
      )
        return
      if (libraryBinding(sourceCode, node.callee, 'react') === 'use') {
        component.opaque.add('React.use: inspect the resource responsibility')
        return
      }
      const binding = origin(node.callee)
      if (
        binding &&
        businessSource(binding.source) &&
        !visualSource(binding.source)
      )
        component.business.add(binding.source)
      else if (!binding || !visualSource(binding.source))
        component.opaque.add(sourceCode.getText(node.callee))
    }
    // A similarly named wrapper from another library may inject behavior.
    for (
      let parent = component.node.parent;
      parent &&
      !['VariableDeclarator', 'ExportDefaultDeclaration', 'Program'].includes(
        parent.type,
      );
      parent = parent.parent
    )
      if (parent.type === 'CallExpression') invocation(parent)
    function inspect(node) {
      if (node !== component.node && componentNodes.has(node)) return
      if (node.type === 'JSXFragment') component.elements++
      if (node.type === 'JSXOpeningElement') {
        component.elements++
        let name = node.name
        while (name.type === 'JSXMemberExpression') name = name.object
        if (name.type === 'JSXIdentifier' && /^[A-Z]/u.test(name.name)) {
          let variable
          for (
            let scope = sourceCode.getScope(name);
            scope && !variable;
            scope = scope.upper
          )
            variable = scope.set.get(name.name)
          const definition = variable?.defs[0]
          if (definition?.type === 'ImportBinding') {
            const source = definition.parent.source.value
            if (source.includes('.feature') || source.includes('.state'))
              component.business.add(`composition: ${source}`)
            else if (!visualSource(source)) component.opaque.add(source)
          } else if (
            components.some((candidate) => candidate.name === name.name)
          )
            component.local.add(name.name)
          else component.opaque.add(name.name)
        }
      }
      if (node.type === 'CallExpression' || node.type === 'NewExpression')
        invocation(node)
      if (node.type === 'Identifier') {
        const variable = findVariable(sourceCode, node)
        const read = variable?.references.some(
          (reference) =>
            reference.identifier === node && reference.isValueReference,
        )
        const binding = read && origin(node)
        if (
          binding &&
          businessSource(binding.source) &&
          !visualSource(binding.source)
        )
          component.business.add(binding.source)
      }
      // Arithmetic may be a business calculation; syntax alone cannot decide.
      if (
        node.type === 'BinaryExpression' &&
        ['+', '-', '*', '/', '%', '**'].includes(node.operator)
      )
        component.opaque.add('calculation')
      for (const child of childrenOf(sourceCode, node)) inspect(child)
    }
    inspect(component.node)
  }
  let changed
  do {
    changed = false
    for (const component of components)
      for (const name of component.local) {
        const child = components.find((candidate) => candidate.name === name)
        if (!child) continue
        for (const key of ['business', 'opaque'])
          for (const signal of child[key]) {
            if (!component[key].has(signal)) {
              component[key].add(signal)
              changed = true
            }
          }
      }
  } while (changed)
  return components
}

export function exportedComponent(node, sourceCode) {
  const ancestors = new Set([node])
  let program
  for (let parent = node.parent; parent; parent = parent.parent) {
    ancestors.add(parent)
    if (parent.type === 'Program') {
      program = parent
      break
    }
    if (
      parent.type === 'ExportNamedDeclaration' ||
      parent.type === 'ExportDefaultDeclaration'
    )
      return true
  }
  return Boolean(
    sourceCode &&
    program &&
    getPublicExports(program, sourceCode).some((entry) =>
      entry.declarations.some((declaration) => ancestors.has(declaration)),
    ),
  )
}
