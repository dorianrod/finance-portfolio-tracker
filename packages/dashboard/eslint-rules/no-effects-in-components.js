import {
  functionVisitors,
  getFunctionComponentName,
  getStaticPropertyName,
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

    const directEffectBindings = new Map()
    const reactObjectBindings = new Set()
    const functionStack = []

    function enterFunction(node) {
      functionStack.push(getFunctionComponentName(node))
    }

    function exitFunction() {
      functionStack.pop()
    }

    function effectName(node) {
      if (node.type === 'Identifier')
        return directEffectBindings.get(node.name) ?? null
      if (
        node.type !== 'MemberExpression' ||
        node.computed ||
        node.object.type !== 'Identifier'
      ) {
        return null
      }

      const name = getStaticPropertyName(node.property)
      return reactObjectBindings.has(node.object.name) && EFFECT_HOOKS.has(name)
        ? name
        : null
    }

    return {
      ...functionVisitors(enterFunction, exitFunction),
      ImportDeclaration(node) {
        if (node.source.value !== 'react') return

        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportDefaultSpecifier' ||
            specifier.type === 'ImportNamespaceSpecifier'
          ) {
            reactObjectBindings.add(specifier.local.name)
            continue
          }
          if (specifier.type !== 'ImportSpecifier') continue

          const importedName = getStaticPropertyName(specifier.imported)
          if (EFFECT_HOOKS.has(importedName)) {
            directEffectBindings.set(specifier.local.name, importedName)
          }
        }
      },
      CallExpression(node) {
        const componentName = functionStack.at(-1)
        if (!componentName) return

        const hook = effectName(node.callee)
        if (!hook) return

        context.report({
          node,
          messageId: 'extractEffect',
          data: { hook, name: componentName },
        })
      },
    }
  },
}
