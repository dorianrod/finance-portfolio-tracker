import { findVariable, stableInitializer, unwrap } from './ast-bindings.js'
import { libraryBinding } from './library-binding.js'

export function isTestFile(filename) {
  return /(?:\.(?:test|spec)\.[cm]?[jt]sx?$|[/\\]__tests__[/\\])/u.test(
    filename,
  )
}

export function memberName(node) {
  return node?.type === 'MemberExpression'
    ? node.computed
      ? node.property.value
      : node.property.name
    : undefined
}

export function isGlobal(source, node, name) {
  return (
    node?.type === 'Identifier' &&
    node.name === name &&
    !(findVariable(source, node)?.defs.length > 0)
  )
}

export function isExpectCall(source, input) {
  const node = unwrap(input)
  let callee = resolveTestValue(source, node?.callee)
  if (
    callee?.type === 'MemberExpression' &&
    ['soft', 'poll'].includes(memberName(callee))
  )
    callee = callee.object
  return (
    node?.type === 'CallExpression' &&
    (isGlobal(source, callee, 'expect') ||
      ['vitest', '@jest/globals'].some(
        (library) => libraryBinding(source, callee, library) === 'expect',
      ))
  )
}

export function assertionOf(source, node) {
  const matcher = resolveTestValue(source, node.callee)
  if (matcher?.type !== 'MemberExpression') return null
  let receiver = unwrap(matcher.object)
  while (receiver?.type === 'MemberExpression')
    receiver = unwrap(receiver.object)
  if (!isExpectCall(source, receiver)) return null
  return {
    actual: receiver.arguments[0],
    matcher: memberName(matcher),
    expected: node.arguments,
  }
}

export function resolveTestValue(source, input, seen = new Set()) {
  const node = unwrap(input)
  if (!node || seen.has(node)) return null
  seen.add(node)
  return node.type === 'Identifier'
    ? (resolveTestValue(source, stableInitializer(source, node), seen) ?? node)
    : node
}

export function staticTestText(source, input, seen = new Set()) {
  const node = unwrap(input)
  if (!node || seen.has(node)) return null
  seen.add(node)
  if (node.type === 'Literal')
    return (
      node.regex?.pattern ??
      (typeof node.value === 'string' ? node.value : null)
    )
  if (node.type === 'Identifier')
    return staticTestText(source, stableInitializer(source, node), seen)
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0)
    return node.quasis[0].value.cooked
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    const left = staticTestText(source, node.left, new Set(seen))
    const right = staticTestText(source, node.right, new Set(seen))
    if (left !== null && right !== null) return left + right
  }
  return null
}

export function possibleTestTexts(source, input, seen = new Set()) {
  const node = unwrap(input)
  if (!node || seen.has(node)) return []
  seen.add(node)
  const text = staticTestText(source, node)
  if (text !== null) return [text]
  if (node.type === 'TemplateLiteral')
    return node.quasis.map((part) => part.value.cooked ?? '')
  if (node.type !== 'Identifier') return []
  const initializer = stableInitializer(source, node)
  if (initializer) return possibleTestTexts(source, initializer, seen)
  const definition = findVariable(source, node)?.defs[0]
  if (definition?.type !== 'Parameter') return []
  const callback = definition.node
  const call = callback.parent
  const each = unwrap(call?.callee)
  if (
    call?.type !== 'CallExpression' ||
    each?.type !== 'CallExpression' ||
    memberName(each.callee) !== 'each'
  )
    return []
  let runner = each.callee.object
  while (
    runner?.type === 'MemberExpression' &&
    ['only', 'skip', 'concurrent', 'sequential', 'fails'].includes(
      memberName(runner),
    )
  )
    runner = runner.object
  if (
    !['it', 'test'].some((name) => isGlobal(source, runner, name)) &&
    !['vitest', '@jest/globals'].some((library) =>
      ['it', 'test'].includes(libraryBinding(source, runner, library)),
    )
  )
    return []
  const table = resolveTestValue(source, each.arguments[0])
  if (table?.type !== 'ArrayExpression') return []
  const parameterIndex = callback.params.findIndex(
    (parameter) =>
      parameter === definition.name ||
      (parameter.type === 'ObjectPattern' &&
        parameter.properties.some(
          (property) => property.value?.name === node.name,
        )),
  )
  const parameter = callback.params[parameterIndex]
  const key =
    parameter?.type === 'ObjectPattern'
      ? parameter.properties.find(
          (property) => property.value?.name === node.name,
        )?.key
      : null
  return table.elements.flatMap((inputRow) => {
    const row = resolveTestValue(source, inputRow)
    let value =
      row?.type === 'ArrayExpression'
        ? row.elements[parameterIndex]
        : parameterIndex === 0
          ? row
          : null
    value = resolveTestValue(source, value)
    if (key && value?.type === 'ObjectExpression')
      value = value.properties.find(
        (property) =>
          (property.key?.name ?? property.key?.value) ===
          (key.name ?? key.value),
      )?.value
    return possibleTestTexts(source, value, new Set(seen))
  })
}

export function testingLibraryBinding(source, input, seen = new Set()) {
  const node = unwrap(input)
  if (!node || seen.has(node)) return null
  seen.add(node)
  for (const library of ['@testing-library/react', '@testing-library/dom']) {
    const binding = libraryBinding(source, node, library)
    if (binding) return binding
  }
  if (node.type === 'CallExpression') {
    const callee = testingLibraryBinding(source, node.callee, seen)
    if (callee === 'within' || callee === 'render') return 'queries'
  }
  if (node.type === 'MemberExpression') {
    const owner = testingLibraryBinding(source, node.object, seen)
    if (owner === 'screen' || owner === 'queries') return memberName(node)
  }
  if (node.type === 'Identifier') {
    const definition = findVariable(source, node)?.defs[0]
    if (
      definition?.type === 'Variable' &&
      definition.node.id.type === 'ObjectPattern'
    ) {
      const property = definition.node.id.properties.find(
        (entry) => entry.value?.name === node.name,
      )
      if (
        property &&
        testingLibraryBinding(source, definition.node.init, seen) === 'queries'
      )
        return property.key.name ?? property.key.value
    }
    return testingLibraryBinding(source, stableInitializer(source, node), seen)
  }
  return null
}

export function isDomNode(context, input, seen = new Set()) {
  const source = context.sourceCode
  const node = resolveTestValue(source, input)
  if (!node || seen.has(node)) return false
  seen.add(node)
  const services = source.parserServices
  const typedNode = services.esTreeNodeToTSNodeMap?.get(node)
  if (services.program && typedNode) {
    const checker = services.program.getTypeChecker()
    const type = checker.getTypeAtLocation(typedNode)
    const types = type.isUnion() ? type.types : [type]
    if (
      types.some((entry) =>
        entry
          .getProperty('nodeType')
          ?.declarations?.some((declaration) =>
            /[/\\]lib\.dom\.d\.ts$/u.test(declaration.getSourceFile().fileName),
          ),
      )
    )
      return true
  }
  if (isGlobal(source, node, 'document')) return true
  if (testingLibraryBinding(source, node) === 'container') return true
  if (
    node.type === 'MemberExpression' &&
    ['body', 'documentElement', 'firstElementChild', 'parentElement'].includes(
      memberName(node),
    )
  )
    return isDomNode(context, node.object, seen)
  if (node.type === 'CallExpression') {
    const binding = testingLibraryBinding(source, node.callee)
    if (/^(?:get|query|find)By/u.test(binding ?? '')) return true
    if (
      ['querySelector', 'closest', 'getElementById'].includes(
        memberName(node.callee),
      )
    )
      return isDomNode(context, node.callee.object, seen)
  }
  return false
}
