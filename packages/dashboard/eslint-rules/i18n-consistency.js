import { readFileSync } from 'node:fs'

const catalogUrl = new URL('../src/i18n/locales/en.json', import.meta.url)

function translationCall(node) {
  return (
    node.callee.type === 'MemberExpression' &&
    !node.callee.computed &&
    node.callee.object.type === 'Identifier' &&
    node.callee.object.name === 'i18n' &&
    node.callee.property.type === 'Identifier' &&
    node.callee.property.name === 't'
  )
}

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
      defaultValue:
        'Do not use a default translation value; add the key to the catalog.',
      dynamicKey:
        'Use a literal i18n key so the catalog can be audited statically.',
      missingInterpolation:
        'Translation "{{key}}" requires interpolation option "{{name}}".',
      missingKey:
        'Translation key "{{key}}" is missing from the English catalog.',
    },
    schema: [],
  },
  create(context) {
    // ESLint keeps rule modules loaded in the editor across catalog edits.
    let catalog

    return {
      CallExpression(node) {
        if (!translationCall(node)) return
        // Most modules do not translate anything. Read once per linted file,
        // only when needed, while still observing catalog edits in the editor.
        catalog ??= JSON.parse(readFileSync(catalogUrl, 'utf8'))
        const [keyNode, optionsNode] = node.arguments
        if (keyNode?.type !== 'Literal' || typeof keyNode.value !== 'string') {
          context.report({ node: keyNode ?? node, messageId: 'dynamicKey' })
          return
        }
        const key = keyNode.value
        const catalogKey =
          key in catalog
            ? key
            : `${key}_one` in catalog && `${key}_other` in catalog
              ? `${key}_other`
              : null
        if (!catalogKey) {
          context.report({
            node: keyNode,
            messageId: 'missingKey',
            data: { key },
          })
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
      },
    }
  },
}
