import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'
import { afterEach, describe, expect, it } from 'vitest'

import featureFolderLayout from './feature-folder-layout.js'
import importBoundaries from './import-boundaries.js'
import reviewSharedFeatureSharing from './review-shared-feature-sharing.js'
import sharedFeatureUsage from './shared-feature-usage.js'

const directories = []
const parent = 'src/domains/example/features/analysis'

afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true })
})

function lint(file, code, additionalFiles = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'architecture-boundaries-'))
  directories.push(directory)
  const files = {
    'tsconfig.json': JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        paths: { '@/*': ['./src/*'] },
      },
      include: ['src'],
    }),
    [`${parent}/shared/types/input.ts`]: 'export type Input = number',
    [`${parent}/features/first/services/read.ts`]: 'export const value = 1',
    [`${parent}/features/first/components/First.feature.tsx`]:
      'export function First() { return null }',
    [`${parent}/features/second/services/read.ts`]: 'export const value = 2',
    ...additionalFiles,
    [file]: code,
  }
  for (const [name, text] of Object.entries(files)) {
    const path = join(directory, name)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, text)
  }
  return new Linter({ cwd: directory }).verify(
    code,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          project: join(directory, 'tsconfig.json'),
          tsconfigRootDir: directory,
        },
      },
      plugins: {
        local: {
          rules: {
            'feature-folder-layout': featureFolderLayout,
            'import-boundaries': importBoundaries,
            'shared-feature-usage': sharedFeatureUsage,
            'review-shared-feature-sharing': reviewSharedFeatureSharing,
          },
        },
      },
      rules: {
        'local/feature-folder-layout': 'error',
        'local/import-boundaries': 'error',
        'local/shared-feature-usage': 'error',
        'local/review-shared-feature-sharing': 'warn',
      },
    },
    { filename: join(directory, file) },
  )
}

describe('folder layout and import boundaries together', () => {
  it('reports only layout when a parent service is misplaced', () => {
    expect(
      lint(
        `${parent}/services/read.ts`,
        `import type {Input} from '@/${parent.slice(4)}/shared/types/input'`,
      ),
    ).toMatchObject([
      { ruleId: 'local/feature-folder-layout', messageId: 'parentFolder' },
    ])
  })

  it('reports only layout for a leaf shared wrapper', () => {
    expect(
      lint(
        `${parent}/features/first/shared/services/read.ts`,
        `import type {Input} from '@/${parent.slice(4)}/shared/types/input'`,
      ),
    ).toMatchObject([
      { ruleId: 'local/feature-folder-layout', messageId: 'leafFolder' },
    ])
  })

  it('reports only imports for a correctly located sibling dependency', () => {
    expect(
      lint(
        `${parent}/features/first/services/read.ts`,
        `import {value} from '@/${parent.slice(4)}/features/second/services/read'`,
      ),
    ).toMatchObject([
      { ruleId: 'local/import-boundaries', messageId: 'siblingFeature' },
    ])
  })

  it('reports only imports when a parent shared service reaches into a child', () => {
    expect(
      lint(
        `${parent}/shared/services/read.ts`,
        `import {value} from '@/${parent.slice(4)}/features/first/services/read'`,
      ),
    ).toMatchObject([
      { ruleId: 'local/import-boundaries', messageId: 'sharedScope' },
    ])
  })

  it('rejects hiding parent UI composition under shared', () => {
    expect(
      lint(
        `${parent}/shared/components/Analysis.feature.tsx`,
        `import {First} from '@/${parent.slice(4)}/features/first/components/First.feature'; export function Analysis() {return First()}`,
      ),
    ).toMatchObject([
      { ruleId: 'local/import-boundaries', messageId: 'sharedScope' },
    ])
  })

  it('allows application composition of features', () => {
    expect(
      lint(
        'src/app/Analysis.feature.tsx',
        `import {First} from '@/${parent.slice(4)}/features/first/components/First.feature'; export function Analysis() {return First()}`,
      ),
    ).toEqual([])
  })

  it('allows a leaf to consume an ancestor shared contract', () => {
    expect(
      lint(
        `${parent}/features/first/services/read.ts`,
        `import type {Input} from '@/${parent.slice(4)}/shared/types/input'`,
      ),
    ).toEqual([])
  })
})

describe('actual shared feature consumers', () => {
  const target = `${parent}/shared/helpers/calculate.ts`
  const dependency = `@/${target.slice(4, -3)}`
  const useShared = `import {value} from '${dependency}'; export const result = value`

  it('does not confuse several files in one feature with several features', () => {
    expect(
      lint(target, 'export const value = 1', {
        [`${parent}/features/first/services/read.ts`]: useShared,
        [`${parent}/features/first/services/other.ts`]: useShared,
      }),
    ).toMatchObject([
      {
        ruleId: 'local/shared-feature-usage',
        messageId: 'singleFeature',
        severity: 2,
      },
    ])
  })

  it('accepts use by two distinct children', () => {
    expect(
      lint(target, 'export const value = 1', {
        [`${parent}/features/first/services/read.ts`]: useShared,
        [`${parent}/features/second/services/read.ts`]: useShared,
      }),
    ).toEqual([])
  })

  it('does not count tests, stories or mocks as a second feature', () => {
    expect(
      lint(target, 'export const value = 1', {
        [`${parent}/features/first/services/read.ts`]: useShared,
        [`${parent}/features/second/services/read.test.ts`]: useShared,
        [`${parent}/features/second/services/read.mock.ts`]: useShared,
        [`${parent}/features/second/components/Example.stories.ts`]: useShared,
        [`${parent}/features/second/mocks/example.ts`]: useShared,
      }),
    ).toMatchObject([
      { ruleId: 'local/shared-feature-usage', messageId: 'singleFeature' },
    ])
  })

  it('follows type-only imports and same-scope re-exports', () => {
    const types = `${parent}/shared/types/input.ts`
    expect(
      lint(types, 'export type Input = number', {
        [`${parent}/shared/types/public.ts`]: `export type {Input} from './input'`,
        [`${parent}/features/first/services/read.ts`]: `import type {Input} from '@/${parent.slice(4)}/shared/types/public'; export type First = Input`,
        [`${parent}/features/second/services/read.ts`]: `import type {Input} from '@/${parent.slice(4)}/shared/types/public'; export type Second = Input`,
      }),
    ).toEqual([])
  })

  it('does not assign every facade consumer to every re-exported module', () => {
    expect(
      lint(target, 'export const value = 1', {
        [`${parent}/shared/helpers/other.ts`]: 'export const other = 2',
        [`${parent}/shared/helpers/public.ts`]:
          "export {value} from './calculate'; export {other} from './other'",
        [`${parent}/features/first/services/read.ts`]: `import {value} from '@/${parent.slice(4)}/shared/helpers/public'; export const result = value`,
        [`${parent}/features/second/services/read.ts`]: `import {other} from '@/${parent.slice(4)}/shared/helpers/public'; export const result = other`,
      }),
    ).toMatchObject([
      { ruleId: 'local/shared-feature-usage', messageId: 'singleFeature' },
    ])
  })

  it('recognizes literal dynamic imports and export-all consumers', () => {
    expect(
      lint(target, 'export const value = 1', {
        [`${parent}/features/first/services/read.ts`]: `export const read = () => import('${dependency}')`,
        [`${parent}/features/second/services/read.ts`]: `export * from '${dependency}'`,
      }),
    ).toEqual([])
  })

  it('uses the nearest owning boundary rather than counting grandchildren twice', () => {
    const domainTarget = 'src/domains/example/shared/helpers/calculate.ts'
    const useDomain = `import {value} from '@/domains/example/shared/helpers/calculate'; export const result = value`
    const messages = lint(domainTarget, 'export const value = 1', {
      [`${parent}/features/first/services/read.ts`]: useDomain,
      [`${parent}/features/second/services/read.ts`]: useDomain,
    })
    expect(messages).toMatchObject([
      { ruleId: 'local/shared-feature-usage', messageId: 'singleFeature' },
    ])
    expect(messages[0].message).toContain('domains/example/features/analysis')
  })

  it('does not manufacture feature consumers from application wrappers', () => {
    expect(
      lint(target, 'export const value = 1', {
        'src/app/First.ts': useShared,
        'src/app/Second.ts': useShared,
      }),
    ).toMatchObject([
      {
        ruleId: 'local/review-shared-feature-sharing',
        messageId: 'unprovenSharing',
        severity: 1,
      },
    ])
  })

  it('detects shared code without any production consumer', () => {
    expect(
      lint(target, 'export const value = 1', {
        [`${parent}/features/first/services/read.test.ts`]: useShared,
      }),
    ).toMatchObject([
      { ruleId: 'local/shared-feature-usage', messageId: 'unusedShared' },
    ])
  })

  it('does not let invalid cross-domain imports establish sharing', () => {
    expect(
      lint(target, 'export const value = 1', {
        [`${parent}/features/first/services/read.ts`]: useShared,
        'src/domains/other/services/read.ts': useShared,
      }),
    ).toMatchObject([
      { ruleId: 'local/shared-feature-usage', messageId: 'singleFeature' },
    ])
  })

  it('does not duplicate non-UI import-boundary diagnostics', () => {
    expect(
      lint(
        target,
        "import {Control} from '@/shared/ui/Control.view'; export const value = Control",
        {
          'src/shared/ui/Control.view.tsx':
            'export function Control() {return null}',
        },
      ),
    ).toMatchObject([
      { ruleId: 'local/import-boundaries', messageId: 'component' },
    ])
  })

  it('terminates on shared wrapper cycles without inflating the feature count', () => {
    expect(
      lint(
        target,
        `import {other} from './other'; export const value = other`,
        {
          [`${parent}/shared/helpers/other.ts`]: `import {value} from './calculate'; export const other = value`,
          [`${parent}/features/first/services/read.ts`]: useShared,
        },
      ),
    ).toMatchObject([
      { ruleId: 'local/shared-feature-usage', messageId: 'singleFeature' },
    ])
  })
})
