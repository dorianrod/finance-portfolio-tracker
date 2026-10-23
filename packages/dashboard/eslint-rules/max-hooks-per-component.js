import {
  functionVisitors,
  getCalleeName,
  getFunctionComponentName,
  isTestFile,
} from './react-component-utils.js'

const DEFAULT_MAX = 6

function isHookCall(node) {
  const name = node?.type === 'CallExpression' ? getCalleeName(node.callee) : null
  return typeof name === 'string' && /^use[A-Z0-9]/u.test(name)
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Limit direct hook orchestration in React function components',
    },
    schema: [{
      type: 'object',
      properties: {
        max: { type: 'integer', minimum: 0 },
      },
      additionalProperties: false,
    }],
    messages: {
      tooManyHooks: 'Component "{{name}}" uses {{count}} direct hooks (maximum: {{max}}). Extract cohesive responsibilities into intent-named custom hooks or child components. [arch-decompose-hook-heavy-components]',
    },
  },
  create(context) {
    if (isTestFile(context.filename)) return {}

    const maximum = context.options[0]?.max ?? DEFAULT_MAX
    const functionStack = []

    function enterFunction(node) {
      functionStack.push({
        count: 0,
        name: getFunctionComponentName(node),
        node,
      })
    }

    function exitFunction() {
      const frame = functionStack.pop()
      if (!frame?.name || frame.count <= maximum) return

      context.report({
        node: frame.node.id ?? frame.node,
        messageId: 'tooManyHooks',
        data: {
          count: frame.count,
          max: maximum,
          name: frame.name,
        },
      })
    }

    return {
      ...functionVisitors(enterFunction, exitFunction),
      CallExpression(node) {
        const frame = functionStack.at(-1)
        if (frame?.name && isHookCall(node)) frame.count += 1
      },
    }
  },
}
