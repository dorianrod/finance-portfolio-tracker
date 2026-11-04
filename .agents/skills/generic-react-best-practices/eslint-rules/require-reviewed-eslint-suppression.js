import { reportSuppression } from './eslint-suppression-processor.js'
import { parseEslintSuppression } from './parse-eslint-suppression.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require line-scoped ESLint exceptions with a reason and last review date',
    },
    schema: [],
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const suppression = parseEslintSuppression(comment)
          if (suppression?.problem) {
            reportSuppression(
              context,
              comment,
              `${suppression.problem} Read the affected code and rule before accepting an exception. [quality-eslint-disable-scoped]`,
              2,
            )
          }
        }
      },
    }
  },
}
