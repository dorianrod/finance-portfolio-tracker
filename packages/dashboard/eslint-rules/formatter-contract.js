import ts from 'typescript'

import { isProductionSource } from './ast-bindings.js'
import { getPublicExports } from './get-public-exports.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require nullable formatter inputs and configurable display fallbacks',
    },
    schema: [],
    messages: {
      nullable:
        'The formatter value must accept both null and undefined. [helpers-formatter-hooks]',
      fallback:
        'Expose a configurable fallback option on the formatter. [helpers-formatter-hooks]',
      string:
        'A value-to-text formatter must return string for every input. [helpers-formatter-hooks]',
      callable:
        'A useFormatXxx hook must return a callable value-to-text formatter. [helpers-formatter-hooks]',
      hook: 'Export value-to-text formatters as useFormatXxx hooks returning a formatter, rather than a plain formatting function. [helpers-formatter-hooks]',
    },
  },
  create(context) {
    if (
      !isProductionSource(context.filename) ||
      !/\/helpers\/formatters\//u.test(context.filename)
    )
      return {}
    const services = context.sourceCode.parserServices
    const checker = services.program.getTypeChecker()
    function inspect(identifier, name) {
      if (!identifier) return
      if (name === 'default')
        name =
          identifier.name ??
          context.filename
            .split(/[\\/]/u)
            .at(-1)
            .replace(/\.tsx?$/u, '')
      const declaration = services.esTreeNodeToTSNodeMap.get(identifier)
      const hook = checker.getTypeAtLocation(declaration)
      for (const signature of hook.getCallSignatures()) {
        const formatter = checker.getReturnTypeOfSignature(signature)
        const parts = (
          formatter.isUnion() ? formatter.types : [formatter]
        ).filter(
          (part) =>
            !(part.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)),
        )
        if (
          parts.length > 0 &&
          parts.every((part) => part.flags & ts.TypeFlags.StringLike)
        ) {
          context.report({ node: identifier, messageId: 'hook' })
          continue
        }
        if (!/^useFormat[A-Z]/u.test(name)) {
          if (formatter.getCallSignatures().length > 0)
            context.report({ node: identifier, messageId: 'hook' })
          continue
        }
        if (formatter.getCallSignatures().length === 0)
          context.report({ node: identifier, messageId: 'callable' })
        for (const call of formatter.getCallSignatures()) {
          const value = call.parameters[0]
          if (!value) continue
          const type = checker.getTypeOfSymbolAtLocation(value, declaration)
          const parts = type.isUnion() ? type.types : [type]
          if (
            !parts.some((part) => part.flags & ts.TypeFlags.Null) ||
            !parts.some((part) => part.flags & ts.TypeFlags.Undefined)
          )
            context.report({ node: identifier, messageId: 'nullable' })
          if (
            !call.parameters
              .slice(1)
              .some((parameter) =>
                checker
                  .getNonNullableType(
                    checker.getTypeOfSymbolAtLocation(parameter, declaration),
                  )
                  .getProperty('fallback'),
              )
          )
            context.report({ node: identifier, messageId: 'fallback' })
          const result = checker.getReturnTypeOfSignature(call)
          if (
            !(result.isUnion() ? result.types : [result]).every(
              (part) => part.flags & ts.TypeFlags.StringLike,
            )
          )
            context.report({ node: identifier, messageId: 'string' })
        }
      }
    }
    return {
      'Program:exit'(node) {
        for (const entry of getPublicExports(node, context.sourceCode))
          for (const declaration of entry.declarations)
            inspect(declaration.id ?? declaration, entry.name)
      },
    }
  },
}
