import { basename } from 'node:path'

import { childrenOf, isProductionSource } from './ast-bindings.js'
import { getPublicExports } from './get-public-exports.js'

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
      misplaced:
        'Exported object {{name}} is independent of this module’s public function signatures. Move an entity to types/{{file}}.type.ts; keep private implementation shapes local. [types-file-per-entity]',
    },
  },
  create(context) {
    if (
      !isProductionSource(context.filename) ||
      !/\/(?:domains|shared)\//u.test(context.filename) ||
      !context.filename.endsWith('.ts')
    )
      return {}
    const source = context.sourceCode
    const canonical = /\/types\/.*\.type\.ts$/u.test(context.filename)
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
    function exportedTypes(program) {
      const names = new Set(
        program.body
          .filter(
            (node) => node.type === 'ExportNamedDeclaration' && !node.source,
          )
          .flatMap((node) =>
            node.specifiers.map((specifier) => specifier.local.name),
          ),
      )
      return program.body.flatMap((node) =>
        node.type === 'ExportNamedDeclaration' &&
        node.declaration?.type === 'TSTypeAliasDeclaration'
          ? [node.declaration]
          : node.type === 'TSTypeAliasDeclaration' && names.has(node.id.name)
            ? [node]
            : [],
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
        if (!canonical) {
          if (
            !/\/src\/domains\//u.test(context.filename) ||
            getPublicExports(program, source).length === 0
          )
            return
          const types = exportedTypes(program)
          const signatures = getPublicExports(program, source)
            .flatMap((entry) => entry.declarations)
            .flatMap((node) => {
              const value =
                node.type === 'VariableDeclarator' ? node.init : node
              return [
                ...(value?.params ?? []),
                value?.returnType,
                node.id?.typeAnnotation,
              ].filter(Boolean)
            })
          const support = new Set(
            types.filter((node) =>
              signatures.some((signature) =>
                references(signature, node.id.name),
              ),
            ),
          )
          let size
          do {
            size = support.size
            for (const node of types)
              if (
                [...support].some((parent) =>
                  references(parent.typeAnnotation, node.id.name),
                )
              )
                support.add(node)
          } while (size !== support.size)
          for (const node of types)
            if (
              node.typeAnnotation.type === 'TSTypeLiteral' &&
              !support.has(node)
            )
              context.report({
                node,
                messageId: 'misplaced',
                data: {
                  name: node.id.name,
                  file: node.id.name[0].toLowerCase() + node.id.name.slice(1),
                },
              })
          return
        }
        const types = exportedTypes(program)
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
