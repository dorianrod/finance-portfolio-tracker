import { createInternalLayoutAnalysis } from './shared-ui-internal-layout-analysis.js'

const analyses = new WeakMap()

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Keep caller layout outside visual shared UI boundaries',
    },
    schema: [],
    messages: {
      internal:
        'Move caller layout out of shared/ui content. Use standardized UI structure, sizes and spacing instead. Found at {{location}}. [styling-external-layout-only]',
      unverifiable:
        'Cannot verify layout injected into shared/ui content at {{location}}. Supply semantic UI composition instead of opaque class/style props. [styling-external-layout-only]',
      descendant:
        'Do not override shared/ui internals through a descendant selector. Keep layout on the outside container. Found at {{location}}. [styling-external-layout-only]',
    },
  },
  create(context) {
    const services = context.sourceCode.parserServices
    if (!services.program || !services.esTreeNodeToTSNodeMap)
      throw new Error('no-shared-ui-internal-layout requires typed linting.')
    let analysis = analyses.get(services.program)
    if (!analysis) {
      analysis = createInternalLayoutAnalysis(services.program)
      analyses.set(services.program, analysis)
    }
    return {
      Program(node) {
        const source = services.esTreeNodeToTSNodeMap.get(node)
        for (const finding of analysis.inspect(source)) {
          const origin = finding.node.getSourceFile()
          const position = origin.getLineAndCharacterOfPosition(
            finding.node.getStart(),
          )
          const target = origin === source ? finding.node : finding.owner
          const mapped = target && services.tsNodeToESTreeNodeMap.get(target)
          if (!mapped) continue
          context.report({
            node: mapped,
            messageId: finding.kind,
            data: {
              location: `${origin.fileName.split('/src/').at(-1)}:${position.line + 1}`,
            },
          })
        }
      },
    }
  },
}
