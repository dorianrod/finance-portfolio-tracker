import { reportSuppression } from './eslint-suppression-processor.js'
import { parseEslintSuppression } from './parse-eslint-suppression.js'

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Count each reviewed ESLint exception as one warning',
    },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const suppression = parseEslintSuppression(comment)
          if (suppression && !suppression.problem) {
            reportSuppression(
              context,
              comment,
              `Reviewed ESLint exception for ${suppression.rules.join(', ')} -- reviewed: ${suppression.reviewed}; ${suppression.reason} [quality-eslint-warning-budget]`,
              1,
            )
          }
        }
      },
    }
  },
}
