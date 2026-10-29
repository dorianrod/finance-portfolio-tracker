const diagnosticsByFile = new Map()
const policyRules = new Set([
  'local/require-reviewed-eslint-suppression',
  'local/reviewed-eslint-suppression',
])

// A blanket eslint-disable would otherwise hide the policy's own diagnostics.
// Keep the normal rule reports for standalone use and restore them after ESLint
// applies suppressions when this identity processor is enabled.
export function reportSuppression(context, comment, message, severity) {
  context.report({ loc: comment.loc, message })
  diagnosticsByFile.get(context.filename)?.push({
    ruleId: context.id,
    severity,
    message,
    line: comment.loc.start.line,
    column: comment.loc.start.column + 1,
    endLine: comment.loc.end.line,
    endColumn: comment.loc.end.column + 1,
  })
}

export default {
  meta: { name: 'reviewed-eslint-suppressions', version: '1.0.0' },
  supportsAutofix: true,
  preprocess(text, filename) {
    diagnosticsByFile.set(filename, [])
    return [text]
  },
  postprocess(messageLists, filename) {
    const diagnostics = diagnosticsByFile.get(filename) ?? []
    diagnosticsByFile.delete(filename)
    return [
      ...messageLists.flat().filter(({ ruleId }) => !policyRules.has(ruleId)),
      ...diagnostics,
    ].sort((a, b) => a.line - b.line || a.column - b.column)
  },
}
