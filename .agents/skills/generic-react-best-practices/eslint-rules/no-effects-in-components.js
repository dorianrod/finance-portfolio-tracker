import { libraryBinding } from './library-binding.js'
import {
  functionVisitors,
  getFunctionComponentName,
  isTestFile,
} from './react-component-utils.js'

const EFFECT_HOOKS = new Set(['useEffect', 'useLayoutEffect'])

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require React effects to live in intent-named custom hooks',
    },
    schema: [],
    messages: {
      extractEffect:
        'Move {{hook}} out of component "{{name}}" into an intent-named custom hook. [arch-isolate-effects-in-hooks]',
    },
  },
  create(context) {
    if (isTestFile(context.filename)) return {}

    const functionStack = []

    function enterFunction(node) {
      functionStack.push(getFunctionComponentName(node, context.sourceCode))
    }

    function exitFunction() {
      functionStack.pop()
    }

    return {
      ...functionVisitors(enterFunction, exitFunction),
      CallExpression(node) {
        const componentName = functionStack.at(-1)
        if (!componentName) return

        const hook = libraryBinding(context.sourceCode, node.callee, 'react')
        if (!EFFECT_HOOKS.has(hook)) return

        context.report({
          node,
          messageId: 'extractEffect',
          data: { hook, name: componentName },
        })
      },
    }
  },
}
