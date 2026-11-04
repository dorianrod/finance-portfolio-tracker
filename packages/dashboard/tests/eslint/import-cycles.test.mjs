import { resolve } from 'node:path'

import { findImportCycles } from '@frontend-engineering/react-best-practices/scripts/import-cycles.mjs'
import { expect, it } from 'vitest'

it('keeps the actual application production graph free of runtime cycles', () => {
  expect(
    findImportCycles(resolve(import.meta.dirname, '../../tsconfig.app.json')),
  ).toEqual([])
})
