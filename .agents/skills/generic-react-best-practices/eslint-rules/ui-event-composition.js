import {
  childrenOf,
  findVariable,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'

export function isCancelableHandler(context, input) {
  const services = context.sourceCode.parserServices
  const checker = services.program.getTypeChecker()
  const node = services.esTreeNodeToTSNodeMap.get(unwrap(input))
  if (!node) return false
  const type = checker.getNonNullableType(
    checker.getContextualType(node) ?? checker.getTypeAtLocation(node),
  )
  return type.getCallSignatures().some((signature) => {
    const parameter = signature.getParameters()[0]
    return (
      parameter &&
      checker
        .getNonNullableType(checker.getTypeOfSymbolAtLocation(parameter, node))
        .getProperty('defaultPrevented')
    )
  })
}

export function analyzeEventComposition(
  context,
  input,
  matchesCaller,
  cancelable,
) {
  const source = context.sourceCode
  const checker = source.parserServices.program.getTypeChecker()
  const result = { preserved: false, order: false, cancellation: false }
  function resolve(input, seen = new Set()) {
    const node = unwrap(input)
    if (!node || seen.has(node)) return null
    seen.add(node)
    if (matchesCaller(node)) return node
    const initializer = stableInitializer(source, node)
    if (initializer) return resolve(initializer, seen)
    if (node.type === 'Identifier') {
      const definition = findVariable(source, node)?.defs[0]
      if (definition?.type === 'FunctionName') return definition.node
    }
    return node
  }
  function isCaller(input) {
    const node = resolve(input)
    if (matchesCaller(node)) return true
    return (
      node?.type === 'MemberExpression' &&
      ['call', 'apply'].includes(name(node)) &&
      matchesCaller(resolve(node.object))
    )
  }
  const handler = resolve(input)
  if (isCaller(handler)) return { ...result, preserved: true }
  if (
    ![
      'ArrowFunctionExpression',
      'FunctionExpression',
      'FunctionDeclaration',
    ].includes(handler?.type)
  )
    return result
  const eventVariable = findVariable(source, handler.params[0])
  function isEvent(node) {
    return (
      eventVariable && findVariable(source, resolve(node)) === eventVariable
    )
  }
  function name(node) {
    return node?.computed ? node.property?.value : node?.property?.name
  }
  function cancelCondition(input) {
    const node = resolve(input)
    if (
      node?.type === 'MemberExpression' &&
      name(node) === 'defaultPrevented' &&
      isEvent(node.object)
    )
      return true
    if (node?.type === 'UnaryExpression' && node.operator === '!') {
      const condition = cancelCondition(node.argument)
      return condition === null ? null : !condition
    }
    if (
      node?.type === 'BinaryExpression' &&
      ['===', '==', '!==', '!='].includes(node.operator)
    ) {
      const literal = node.right.type === 'Literal' ? node.right : node.left
      const condition = cancelCondition(
        literal === node.right ? node.left : node.right,
      )
      if (condition !== null && typeof literal.value === 'boolean')
        return ['===', '=='].includes(node.operator)
          ? condition === literal.value
          : condition !== literal.value
    }
    return null
  }
  function passiveCall(node) {
    const callee = unwrap(node.callee)
    if (callee?.type !== 'MemberExpression') return false
    if (
      isEvent(callee.object) &&
      [
        'preventDefault',
        'stopPropagation',
        'isDefaultPrevented',
        'isPropagationStopped',
      ].includes(name(callee))
    )
      return true
    if (
      ![
        'contains',
        'getElementById',
        'querySelector',
        'querySelectorAll',
        'matches',
        'closest',
        'getBoundingClientRect',
      ].includes(name(callee))
    )
      return false
    const symbol = checker.getSymbolAtLocation(
      source.parserServices.esTreeNodeToTSNodeMap.get(callee.property),
    )
    return (
      symbol?.declarations?.some((entry) =>
        /[/\\]lib\.dom\.d\.ts$/u.test(entry.getSourceFile().fileName),
      ) ?? false
    )
  }
  function work(state) {
    if (!cancelable) return
    if (!state.forwarded) result.order = true
    else if (!state.guarded) result.cancellation = true
  }
  function unique(states) {
    return [
      ...new Map(
        states.map((state) => [`${state.forwarded}:${state.guarded}`, state]),
      ).values(),
    ]
  }
  function branch(state, condition, truthy) {
    return condition === !truthy
      ? { ...state, guarded: state.forwarded }
      : state
  }
  function expression(input, state) {
    const node = unwrap(input)
    if (
      !node ||
      [
        'ArrowFunctionExpression',
        'FunctionExpression',
        'FunctionDeclaration',
      ].includes(node.type)
    )
      return [state]
    if (node.type === 'CallExpression' || node.type === 'NewExpression') {
      let states = [state]
      if (node.callee?.type === 'MemberExpression')
        states = expression(node.callee.object, state)
      for (const argument of node.arguments)
        states = states.flatMap((current) => expression(argument, current))
      if (node.type === 'CallExpression' && isCaller(node.callee)) {
        result.preserved = true
        return states.map(() => ({ forwarded: true, guarded: false }))
      }
      if (node.type === 'NewExpression' || !passiveCall(node))
        states.forEach(work)
      return states
    }
    if (node.type === 'LogicalExpression') {
      const left = expression(node.left, state)
      const literal = resolve(node.left)
      if (
        literal?.type === 'Literal' &&
        typeof literal.value === 'boolean' &&
        ['&&', '||'].includes(node.operator)
      ) {
        const execute = node.operator === '&&' ? literal.value : !literal.value
        return execute
          ? left.flatMap((current) => expression(node.right, current))
          : left
      }
      const condition = cancelCondition(node.left)
      const truthy = node.operator === '&&'
      return unique([
        ...left,
        ...left.flatMap((current) =>
          expression(node.right, branch(current, condition, truthy)),
        ),
      ])
    }
    if (node.type === 'ConditionalExpression') {
      const states = expression(node.test, state)
      const literal = resolve(node.test)
      if (literal?.type === 'Literal' && typeof literal.value === 'boolean')
        return states.flatMap((current) =>
          expression(literal.value ? node.consequent : node.alternate, current),
        )
      const condition = cancelCondition(node.test)
      return unique(
        states.flatMap((current) => [
          ...expression(node.consequent, branch(current, condition, true)),
          ...expression(node.alternate, branch(current, condition, false)),
        ]),
      )
    }
    let states = [state]
    for (const child of childrenOf(source, node))
      states = states.flatMap((current) => expression(child, current))
    if (
      [
        'AssignmentExpression',
        'UpdateExpression',
        'AwaitExpression',
        'YieldExpression',
      ].includes(node.type)
    )
      states.forEach(work)
    return unique(states)
  }
  function statement(node, states) {
    if (node.type === 'BlockStatement') {
      for (const entry of node.body) states = statement(entry, states)
      return states
    }
    if (node.type === 'IfStatement') {
      const inputs = states.flatMap((state) => expression(node.test, state))
      const literal = resolve(node.test)
      if (literal?.type === 'Literal' && typeof literal.value === 'boolean') {
        const selected = literal.value ? node.consequent : node.alternate
        return selected ? statement(selected, inputs) : inputs
      }
      const condition = cancelCondition(node.test)
      return unique(
        inputs.flatMap((state) => [
          ...statement(node.consequent, [branch(state, condition, true)]),
          ...(node.alternate
            ? statement(node.alternate, [branch(state, condition, false)])
            : [branch(state, condition, false)]),
        ]),
      )
    }
    if (node.type === 'ReturnStatement' || node.type === 'ThrowStatement') {
      states.forEach((state) => expression(node.argument, state))
      return []
    }
    if (node.type === 'ExpressionStatement')
      return unique(
        states.flatMap((state) => expression(node.expression, state)),
      )
    if (node.type === 'VariableDeclaration') {
      for (const declaration of node.declarations)
        states = states.flatMap((state) => expression(declaration.init, state))
      return unique(states)
    }
    // Unknown control flow cannot establish that forwarding dominates later work.
    for (const state of states)
      for (const child of childrenOf(source, node)) expression(child, state)
    return states
  }
  const initial = { forwarded: false, guarded: false }
  if (handler.body.type === 'BlockStatement') statement(handler.body, [initial])
  else expression(handler.body, initial)
  return result
}
