import { getPublicExports } from './get-public-exports.js'

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Allow at most one public value per production module',
    },
    schema: [],
    messages: {
      multiple:
        'Export at most one value per file; extract other public values into named files and group related files in a themed directory. Type-only exports and private declarations are allowed. [quality-single-public-export]',
      wildcard:
        'Replace export * with an explicit single value export or direct imports; wildcard exports cannot guarantee one public value. [quality-single-public-export]',
    },
  },
  create(context) {
    return {
      'Program:exit'(program) {
        const exports = getPublicExports(program, context.sourceCode)
        const values = exports.filter(({ wildcard }) => !wildcard)
        for (const { node } of exports.filter(({ wildcard }) => wildcard)) {
          context.report({ node, messageId: 'wildcard' })
        }
        for (const { node } of values.slice(1)) {
          context.report({ node, messageId: 'multiple' })
        }
      },
    }
  },
}
