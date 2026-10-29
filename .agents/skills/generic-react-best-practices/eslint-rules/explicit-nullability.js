import { isProductionSource } from './ast-bindings.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Keep optional and nullable domain properties distinct',
    },
    schema: [],
    messages: {
      optionalNullable:
        'Choose an optional property or a required nullable property instead of combining both. [types-explicit-nullability]',
    },
  },
  create(context) {
    if (
      !isProductionSource(context.filename) ||
      !context.filename.includes('/domains/')
    )
      return {}

    return {
      TSPropertySignature(node) {
        if (!node.optional) return
        for (let parent = node.parent; parent; parent = parent.parent)
          if (
            parent.type === 'TSModuleDeclaration' &&
            parent.id.type === 'Literal'
          )
            return
        const annotation = node.typeAnnotation?.typeAnnotation
        if (
          annotation?.type === 'TSUnionType' &&
          annotation.types.some((type) => type.type === 'TSNullKeyword')
        )
          context.report({ node, messageId: 'optionalNullable' })
      },
    }
  },
}
