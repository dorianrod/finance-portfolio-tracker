import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { Linter } from 'eslint'
import { afterEach, describe, expect, it } from 'vitest'

import featureFolderLayout from './feature-folder-layout.js'

const directories = []

afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true })
})

function lint(file, nestedParents = [], options = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'feature-folder-layout-'))
  directories.push(directory)
  for (const parent of nestedParents)
    mkdirSync(
      join(directory, 'src/domains/portfolio/features', parent, 'features'),
      { recursive: true },
    )
  return new Linter({ cwd: directory }).verify(
    'export const value = 1',
    {
      files: ['**/*.ts'],
      plugins: {
        local: { rules: { 'feature-folder-layout': featureFolderLayout } },
      },
      rules: { 'local/feature-folder-layout': ['error', options] },
    },
    { filename: join(directory, file) },
  )
}

describe('parent and leaf feature folder layout', () => {
  it.each([
    'src/domains/contracts/helpers/presenters/tone.ts',
    'src/domains/directory/contacts/shared/helpers/presenters/tone.ts',
    'src/domains/contracts/features/reminders/helpers/presenters/tone.ts',
    'src/domains/components/features/summary/helpers/presenters/tone.ts',
    'src/domains/contracts/features/components/helpers/presenters/tone.ts',
    'src/domains/contracts/helpers/calculators/components/card/helpers/presenters/tone.ts',
  ])('rejects presenters without UI ownership: %s', (file) => {
    expect(lint(file)).toMatchObject([
      { messageId: 'presenterScope', severity: 2 },
    ])
  })

  it.each([
    'src/domains/contracts/components/Card/helpers/presenters/tone.ts',
    'src/domains/contracts/pages/detail/helpers/presenters/tone.ts',
    'src/domains/contracts/shared/components/Card/helpers/presenters/tone.ts',
    'src/domains/contracts/features/reminders/pages/detail/helpers/presenters/tone.ts',
    'src/domains/helpers/presenters/types/value.ts',
    'src/domains/contracts/helpers/formatters/useFormatStatus.ts',
    'src/domains/contracts/helpers/presenters/tone.test.ts',
    'src/shared/helpers/presenters/tone.ts',
    'src/app/helpers/presenters/tone.ts',
  ])('preserves valid owners and neighboring roles: %s', (file) => {
    expect(lint(file)).toEqual([])
  })

  it.each([
    'components',
    'pages',
    'helpers',
    'services',
    'stores',
    'types',
    'constants',
    'apis',
    'mocks',
  ])('rejects the %s folder next to a parent features folder', (role) => {
    expect(
      lint(`src/domains/portfolio/features/analysis/${role}/example.ts`, [
        'analysis',
      ]),
    ).toMatchObject([{ messageId: 'parentFolder', severity: 2 }])
  })

  it.each(['components', 'helpers', 'services', 'stores', 'types'])(
    'allows %s directly inside a leaf feature',
    (role) => {
      expect(
        lint(`src/domains/portfolio/features/analysis/${role}/example.ts`),
      ).toEqual([])
    },
  )

  it.each(['components', 'helpers', 'services', 'stores', 'types'])(
    'rejects an unnecessary shared/%s wrapper in a leaf feature',
    (role) => {
      expect(
        lint(
          `src/domains/portfolio/features/analysis/shared/${role}/example.ts`,
        ),
      ).toMatchObject([{ messageId: 'leafFolder', severity: 2 }])
    },
  )

  it.each([
    'src/domains/portfolio/features/analysis/shared/services/example.ts',
    'src/domains/portfolio/features/analysis/shared/components/Example.feature.ts',
    'src/domains/portfolio/features/analysis/features/detail/services/example.ts',
    'src/shared/helpers/example.ts',
    'src/app/example.ts',
  ])('allows the ownership layout %s', (file) => {
    expect(lint(file, ['analysis'])).toEqual([])
  })

  it('checks nested parent features as well', () => {
    expect(
      lint(
        'src/domains/portfolio/features/analysis/features/detail/services/example.ts',
        ['analysis', 'analysis/features/detail'],
      ),
    ).toMatchObject([{ messageId: 'parentFolder', severity: 2 }])
  })

  it('does not require imports to detect a misplaced file', () => {
    expect(
      lint(
        'src/domains/portfolio/features/analysis/helpers/calculators/calculate.ts',
        ['analysis'],
      ),
    ).toHaveLength(1)
  })

  it('rejects a third feature level without relying on imports or directory contents', () => {
    expect(
      lint(
        'src/domains/portfolio/features/a/features/b/features/c/helpers/value.ts',
      ),
    ).toMatchObject([
      {
        messageId: 'featureDepth',
        severity: 2,
        message: expect.stringContaining('maximum of 2'),
      },
    ])
  })

  it('allows exactly two levels and ignores features inside role folders', () => {
    expect(
      lint('src/domains/portfolio/features/a/features/b/helpers/value.ts'),
    ).toEqual([])
    expect(
      lint(
        'src/domains/portfolio/features/a/helpers/features/b/features/c/value.ts',
      ),
    ).toEqual([])
  })

  it('supports an explicit maximum', () => {
    const file = 'src/domains/portfolio/features/a/features/b/helpers/value.ts'
    expect(lint(file, [], { maxFeatureDepth: 1 })).toMatchObject([
      { messageId: 'featureDepth' },
    ])
    expect(lint(file, [], { maxFeatureDepth: 3 })).toEqual([])
  })
})
