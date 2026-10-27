import { basename } from 'node:path'

import { childrenOf, isProductionSource } from './ast-bindings.js'

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Separate independent entity shapes from the owning type file',
    },
    schema: [],
    messages: {
      independent:
        'Give independent entity {{name}} its own types/{{file}}.type.ts file. Entity sub-shapes and derived variants may stay together. [types-file-per-entity]',
      alias:
        'Declare domain types with type aliases instead of interfaces. [types-file-per-entity]',
    },
  },
  create(context) {
    if (
      !isProductionSource(context.filename) ||
      !/\/types\/.*\.type\.ts$/u.test(context.filename)
    )
      return {}
    const source = context.sourceCode
    const stem = basename(context.filename, '.type.ts')
    const mainName = stem[0].toUpperCase() + stem.slice(1)
    function references(node, name) {
      return (
        (node.type === 'TSTypeReference' &&
          node.typeName.type === 'Identifier' &&
          node.typeName.name === name) ||
        childrenOf(source, node).some((child) => references(child, name))
      )
    }
    return {
      TSInterfaceDeclaration(node) {
        // Dependency module augmentation requires interface merging.
        for (let parent = node.parent; parent; parent = parent.parent)
          if (
            parent.type === 'TSModuleDeclaration' &&
            parent.id.type === 'Literal'
          )
            return
        context.report({ node, messageId: 'alias' })
      },
      'Program:exit'(program) {
        const types = program.body
          .filter(
            (node) =>
              node.type === 'ExportNamedDeclaration' &&
              node.declaration?.type === 'TSTypeAliasDeclaration',
          )
          .map((node) => node.declaration)
        const main = types.find((node) => node.id.name === mainName)
        if (!main) return
        const subshapes = new Set([main])
        let size
        do {
          size = subshapes.size
          for (const node of types)
            if (
              [...subshapes].some((parent) =>
                references(parent.typeAnnotation, node.id.name),
              )
            )
              subshapes.add(node)
        } while (size !== subshapes.size)
        for (const node of types) {
          if (
            node.typeAnnotation.type !== 'TSTypeLiteral' ||
            subshapes.has(node)
          )
            continue
          context.report({
            node,
            messageId: 'independent',
            data: {
              name: node.id.name,
              file: node.id.name[0].toLowerCase() + node.id.name.slice(1),
            },
          })
        }
      },
    }
  },
}
