import { readFileSync } from 'node:fs'

import { isProductionSource } from './ast-bindings.js'
import { isFunctionNode } from './react-component-utils.js'
import { createTranslationResolver } from './translation-bindings.js'
import { translationKeyLiterals } from './translation-key-literals.js'

function optionNames(node) {
  if (node?.type !== 'ObjectExpression') return new Set()
  return new Set(
    node.properties.flatMap((property) => {
      if (property.type !== 'Property' || property.computed) return []
      if (property.key.type === 'Identifier') return [property.key.name]
      if (
        property.key.type === 'Literal' &&
        typeof property.key.value === 'string'
      )
        return [property.key.value]
      return []
    }),
  )
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require literal, existing i18n keys with matching interpolation options.',
    },
    messages: {
      eagerTranslation:
        'Resolve translated display text when the helper or component is called, not while the module is initialized.',
      defaultValue:
        'Do not use a default translation value; add the key to the catalog.',
      dynamicKey:
        'Use a literal i18n key so the catalog can be audited statically.',
      missingInterpolation:
        'Translation "{{key}}" requires interpolation option "{{name}}".',
      missingKey:
        'Translation key "{{key}}" is missing from the English catalog.',
      unformattedDate:
        'Format the Date interpolation value with a formatter hook before translating. [helpers-formatter-hooks]',
    },
    schema: [],
  },
  create(context) {
    // ESLint keeps rule modules loaded in the editor across catalog edits.
    let catalog
    const translationCall = createTranslationResolver(context.sourceCode)
    const services = context.sourceCode.parserServices
    const checker = services?.program?.getTypeChecker()

    function containsDate(type) {
      if (type.isUnion()) return type.types.some(containsDate)
      const symbol = type.getSymbol()
      return (
        symbol?.name === 'Date' &&
        symbol.declarations?.some((declaration) =>
          /[/\\]lib\.es5\.d\.ts$/u.test(declaration.getSourceFile().fileName),
        )
      )
    }

    function evaluatedAtModuleScope(node) {
      for (let parent = node.parent; parent; parent = parent.parent) {
        if (
          isFunctionNode(parent) &&
          !(
            parent.parent.type === 'CallExpression' &&
            parent.parent.callee === parent
          )
        )
          return false
        if (parent.type === 'PropertyDefinition' && !parent.static) return false
      }
      return true
    }

    return {
      CallExpression(node) {
        if (!translationCall(node)) return
        if (
          isProductionSource(context.filename) &&
          evaluatedAtModuleScope(node)
        )
          context.report({ node, messageId: 'eagerTranslation' })
        // Most modules do not translate anything. Read once per linted file,
        // only when needed, while still observing catalog edits in the editor.
        const catalogFile = context.settings['react-best-practices/catalogFile']
        if (!catalogFile)
          throw new Error(
            'Configure react-best-practices/catalogFile with the reference catalog path.',
          )
        catalog ??= JSON.parse(readFileSync(catalogFile, 'utf8'))
        const [keyNode, optionsNode] = node.arguments
        // Check typed direct interpolation values, including aliases and nullable
        // dates. Opaque option objects and nested values still require review.
        if (checker && optionsNode?.type === 'ObjectExpression') {
          for (const property of optionsNode.properties) {
            if (property.type !== 'Property') continue
            const value = services.esTreeNodeToTSNodeMap.get(property.value)
            if (value && containsDate(checker.getTypeAtLocation(value)))
              context.report({
                node: property.value,
                messageId: 'unformattedDate',
              })
          }
        }
        const keyNodes = translationKeyLiterals(keyNode)
        if (!keyNodes) {
          context.report({ node: keyNode ?? node, messageId: 'dynamicKey' })
          return
        }
        if (
          optionsNode?.type === 'Literal' &&
          typeof optionsNode.value === 'string'
        ) {
          context.report({ node: optionsNode, messageId: 'defaultValue' })
          return
        }
        const names = optionNames(optionsNode)
        if (names.has('defaultValue')) {
          context.report({ node: optionsNode, messageId: 'defaultValue' })
        }
        for (const literal of keyNodes) {
          const key = literal.value
          const catalogKey =
            key in catalog
              ? key
              : `${key}_one` in catalog && `${key}_other` in catalog
                ? `${key}_other`
                : null
          if (!catalogKey) {
            context.report({
              node: literal,
              messageId: 'missingKey',
              data: { key },
            })
            continue
          }
          const placeholders = [
            ...catalog[catalogKey].matchAll(/{{\s*([\w.-]+)\s*}}/g),
          ].map((match) => match[1])
          for (const name of placeholders) {
            if (!names.has(name)) {
              context.report({
                node: optionsNode ?? node,
                messageId: 'missingInterpolation',
                data: { key, name },
              })
            }
          }
        }
      },
    }
  },
}
