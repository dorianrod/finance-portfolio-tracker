import { statSync } from 'node:fs'
import { resolve } from 'node:path'

import { featureScopes } from './business-ownership.js'

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Keep parent-feature role folders under shared/ and leaf-feature role folders at their root',
    },
    schema: [],
    messages: {
      parentFolder:
        'Feature "{{feature}}" contains features/: move its "{{folder}}/" folder under shared/. Leaf features may keep role folders at their root. [arch-feature-slice-layout]',
      leafFolder:
        'Feature "{{feature}}" has no features/ folder: keep "{{folder}}/" directly inside the feature instead of shared/. [arch-feature-slice-layout]',
    },
  },
  create(context) {
    const filename = context.filename.replaceAll('\\', '/')
    const marker = filename.indexOf('/src/domains/')
    if (marker === -1) return {}
    const sourceRoot = filename.slice(0, marker + '/src/'.length)
    const source = filename.slice(sourceRoot.length)
    const violations = []
    for (const feature of featureScopes(source)) {
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
