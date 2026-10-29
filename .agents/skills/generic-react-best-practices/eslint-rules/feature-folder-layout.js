import { statSync } from 'node:fs'
import { resolve } from 'node:path'

import { isProductionSource } from './ast-bindings.js'
import { businessScopes, featureScopes } from './business-ownership.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep parent-feature role folders under shared/ and leaf-feature role folders at their root',
    },
    schema: [
      {
        type: 'object',
        properties: { maxFeatureDepth: { type: 'integer', minimum: 1 } },
        additionalProperties: false,
      },
    ],
    messages: {
      parentFolder:
        'Feature "{{feature}}" contains features/: move its "{{folder}}/" folder under shared/. Leaf features may keep role folders at their root. [arch-feature-slice-layout]',
      leafFolder:
        'Feature "{{feature}}" has no features/ folder: keep "{{folder}}/" directly inside the feature instead of shared/. [arch-feature-slice-layout]',
      featureDepth:
        'Feature "{{feature}}" exceeds the maximum of {{max}} feature levels below a domain. Review its business owner. [arch-feature-hierarchy]',
      presenterScope:
        'Keep presenters within an owning component or page. Domain, feature and scoped shared helpers must return UI-agnostic data. [arch-no-visual-logic-below-page]',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/')
    const marker = filename.indexOf('/src/domains/')
    if (marker === -1) return {}
    const sourceRoot = filename.slice(0, marker + '/src/'.length)
    const source = filename.slice(sourceRoot.length)
    const violations = []
    const owner = businessScopes(source).at(-1)
    if (isProductionSource(filename) && owner) {
      const roles = source.slice(owner.length + 1).split('/')
      if (roles[0] === 'shared') roles.shift()
      if (
        /(?:^|\/)helpers\/presenters\//u.test(roles.join('/')) &&
        roles[0] !== 'components' &&
        roles[0] !== 'pages'
      )
        violations.push({ messageId: 'presenterScope' })
    }
    const scopes = featureScopes(source)
    const max = context.options[0]?.maxFeatureDepth ?? 2
    if (scopes.length > max)
      violations.push({
        messageId: 'featureDepth',
        feature: scopes.at(-1),
        max,
      })
    for (const feature of scopes) {
      const [folder, role] = source.slice(feature.length + 1).split('/')
      if (folder === 'features') continue
      const children = statSync(resolve(sourceRoot, feature, 'features'), {
        throwIfNoEntry: false,
      })
      if (children?.isDirectory()) {
        if (folder !== 'shared')
          violations.push({ messageId: 'parentFolder', feature, folder })
      } else if (folder === 'shared') {
        violations.push({ messageId: 'leafFolder', feature, folder: role })
      }
    }
    return {
      Program(node) {
        for (const { messageId, ...data } of violations)
          context.report({ node, messageId, data })
      },
    }
  },
}
