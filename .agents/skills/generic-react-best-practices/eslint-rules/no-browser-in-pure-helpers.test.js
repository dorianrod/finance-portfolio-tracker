import { Linter } from 'eslint'
import { describe, expect, it } from 'vitest'

import noBrowserInPureHelpers from './no-browser-in-pure-helpers.js'

describe('browser boundary source scope', () => {
  it.each([
    'scripts/helpers/transformers/readWidth.js',
    'src/domains/helpers/types/readWidth.js',
    'src/shared/helpers/transformers/readWidth.test.js',
    'src/shared/helpers/transformers/readWidth.d.ts',
    'src/shared/mocks/helpers/transformers/readWidth.js',
  ])(
    'preserves excluded code without requiring typed helper analysis: %s',
    (filename) => {
      expect(
        new Linter().verify(
          'const width = window.innerWidth',
          {
            files: ['**/*.{js,ts}'],
            plugins: {
              local: {
                rules: { 'no-browser-in-pure-helpers': noBrowserInPureHelpers },
              },
            },
            rules: { 'local/no-browser-in-pure-helpers': 'error' },
          },
          { filename },
        ),
      ).toEqual([])
    },
  )
})
