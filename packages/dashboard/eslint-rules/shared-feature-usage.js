import { statSync } from 'node:fs'
import { resolve } from 'node:path'

import { featureScopes, sharedOwner } from './business-ownership.js'
import { sharedFeatureUsageAnalysis } from './shared-feature-usage-analysis.js'

export function createSharedFeatureUsageRule(reviewOnly = false) {
  return {
    meta: {
      type: reviewOnly ? 'suggestion' : 'problem',
      docs: {
        description: reviewOnly
          ? 'Request review when feature sharing cannot be established from static imports'
          : 'Reject business shared code with one exclusive feature owner or no production consumers',
      },
      schema: [],
      messages: {
        singleFeature:
          'This shared module serves only "{{feature}}", including indirect consumers. Keep it with that feature instead of using shared/ to bypass import boundaries. [architecture-feature-ownership]',
        unprovenSharing:
          'This shared module has no proven use by multiple features ({{features}} identified; {{external}} consumers outside the owning feature tree). Review its business owner; application wrappers and tests do not establish sharing. [architecture-feature-ownership]',
        unusedShared:
          'This shared module has no production consumer. Remove it or place it with its actual feature before treating it as shared. [architecture-feature-ownership]',
      },
    },
    create(context) {
      const filename = context.filename.replaceAll('\\', '/')
      const marker = filename.indexOf('/src/domains/')
      if (
        marker === -1 ||
        /\.(?:test|spec|stories)\.[cm]?[jt]sx?$/u.test(filename)
      )
        return {}
      const sourceRoot = filename.slice(0, marker + '/src/'.length)
      const owner = sharedOwner(filename.slice(sourceRoot.length))
      if (!owner) return {}
      // Layout already owns the unnecessary shared wrapper in a leaf feature.
      if (
        featureScopes(`${owner}/placeholder.ts`).includes(owner) &&
        !statSync(resolve(sourceRoot, owner, 'features'), {
          throwIfNoEntry: false,
        })?.isDirectory()
      )
        return {}
      const program = context.sourceCode.parserServices.program
      if (!program)
        throw new Error('shared-feature-usage requires typed linting.')
      return {
        Program(node) {
          const usage = sharedFeatureUsageAnalysis(program, sourceRoot).get(
            resolve(filename),
          )
          // Import boundaries owns invalid downward dependencies; do not duplicate its diagnostic.
          if (
            !usage ||
            usage.hasInvalidDependencies ||
            usage.features.length >= 2
          )
            return
          if (
            usage.features.length === 1 &&
            usage.externalConsumers.length === 0
          ) {
            if (reviewOnly) return
            context.report({
              node,
              messageId: 'singleFeature',
              data: { feature: usage.features[0] },
            })
          } else if (usage.consumers === 0) {
            if (reviewOnly) return
            context.report({ node, messageId: 'unusedShared' })
          } else if (reviewOnly) {
            context.report({
              node,
              messageId: 'unprovenSharing',
              data: {
                features: usage.features.length,
                external: usage.externalConsumers.length,
              },
            })
          }
        },
      }
    },
  }
}

export default createSharedFeatureUsageRule()
