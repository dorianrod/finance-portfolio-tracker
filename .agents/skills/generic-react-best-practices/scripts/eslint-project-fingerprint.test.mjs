import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { ESLint } from 'eslint'
import { afterEach, describe, expect, it } from 'vitest'

import { eslintProjectFingerprint } from './eslint-project-fingerprint.mjs'

const directories = []

function fixture() {
  const directory = mkdtempSync(join(tmpdir(), 'eslint-project-cache-'))
  directories.push(directory)
  write(directory, 'src/target.js', 'export const value = 1')
  return directory
}

function write(directory, path, contents) {
  mkdirSync(dirname(join(directory, path)), { recursive: true })
  writeFileSync(join(directory, path), contents)
}

afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true })
})

describe('project-wide ESLint cache invalidation', () => {
  it.each([
    'src/consumer.ts',
    'src/types.d.ts',
    'src/i18n/locales/en.json',
    'src/shared/ui/storybook/tsconfig.json',
    'eslint-rules/example.js',
    'scripts/check.mjs',
    'eslint.config.js',
    'tsconfig.app.json',
    'package.json',
    'package-lock.json',
    'vite.config.ts',
  ])('invalidates results when %s changes, is added or is deleted', (path) => {
    const directory = fixture()
    const initial = eslintProjectFingerprint(directory)
    write(directory, path, 'first')
    const added = eslintProjectFingerprint(directory)
    expect(added).not.toBe(initial)
    expect(eslintProjectFingerprint(directory)).toBe(added)
    write(directory, path, 'other')
    expect(eslintProjectFingerprint(directory)).not.toBe(added)
    rmSync(join(directory, path))
    expect(eslintProjectFingerprint(directory)).not.toBe(added)
  })

  it('ignores lint cache files and build outputs', () => {
    const directory = fixture()
    const initial = eslintProjectFingerprint(directory)
    write(
      directory,
      'node_modules/.cache/eslint/results.cache',
      'cached result',
    )
    write(directory, 'dist/bundle.js', 'generated bundle')
    write(directory, 'storybook-static/bundle.js', 'generated stories')
    expect(eslintProjectFingerprint(directory)).toBe(initial)
  })

  it('invalidates results after packaged tooling or an external reference catalog changes', () => {
    const directory = fixture()
    const toolingDirectory = fixture()
    const catalog = join(toolingDirectory, 'translations.json')
    write(toolingDirectory, 'translations.json', '{"label":"First"}')
    const options = { toolingDirectory, extraFiles: [catalog] }
    const initial = eslintProjectFingerprint(directory, options)
    write(toolingDirectory, 'eslint-rules/example.js', 'export default {}')
    const changedRule = eslintProjectFingerprint(directory, options)
    expect(changedRule).not.toBe(initial)
    write(toolingDirectory, 'translations.json', '{"label":"Other"}')
    expect(eslintProjectFingerprint(directory, options)).not.toBe(changedRule)
  })

  it('invalidates directory-dependent ownership checks for an empty feature tree', () => {
    const directory = fixture()
    const initial = eslintProjectFingerprint(directory)
    mkdirSync(join(directory, 'src/domains/example/features'), {
      recursive: true,
    })
    expect(eslintProjectFingerprint(directory)).not.toBe(initial)
  })

  it('reuses native ESLint results and rechecks unchanged files after an input edit', async () => {
    const directory = fixture()
    let executions = 0
    const rule = {
      meta: { schema: [], messages: { changed: 'Project inputs changed.' } },
      create(context) {
        executions += 1
        return {
          Program(node) {
            if (context.settings['local/project-fingerprint'] !== original)
              context.report({ node, messageId: 'changed' })
          },
        }
      },
    }
    const original = eslintProjectFingerprint(directory)
    async function lint() {
      const eslint = new ESLint({
        cwd: directory,
        overrideConfigFile: true,
        cache: true,
        cacheStrategy: 'content',
        cacheLocation: join(
          directory,
          'node_modules/.cache/eslint/results.cache',
        ),
        overrideConfig: {
          settings: {
            'local/project-fingerprint': eslintProjectFingerprint(directory),
          },
          plugins: { local: { rules: { example: rule } } },
          rules: { 'local/example': 'warn' },
        },
      })
      return (await eslint.lintFiles(['src/target.js']))[0].messages
    }
    expect(await lint()).toEqual([])
    expect(executions).toBe(1)
    expect(await lint()).toEqual([])
    expect(executions).toBe(1)
    write(directory, 'src/consumer.ts', 'export const consumer = 1')
    expect(await lint()).toMatchObject([{ messageId: 'changed' }])
    expect(executions).toBe(2)
  })
})
