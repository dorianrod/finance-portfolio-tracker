import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { runInNewContext } from 'node:vm'

import { build } from 'vite'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { csvValidationDefines } from '../csvValidationDefines'

afterEach(() => vi.unstubAllEnvs())

describe('CSV validation environment', () => {
  it.each([undefined, 'false', 'true', 'FALSE', '0', ''])(
    'exposes only the explicit DEBUG switch for %j',
    async (value) => {
      vi.stubEnv('DEBUG', value)
      vi.stubEnv('DEBUG_PRIVATE', 'private-environment-value')
      const root = await mkdtemp(join(tmpdir(), 'finance-csv-env-'))
      try {
        const define = csvValidationDefines('test', root)
        expect(define).toEqual({
          'import.meta.env.DEBUG': JSON.stringify(
            value === 'false' ? 'false' : 'true',
          ),
        })
        expect(JSON.stringify(define)).not.toContain(
          'private-environment-value',
        )
      } finally {
        await rm(root, { recursive: true, force: true })
      }
    },
  )

  it('loads DEBUG from env files with mode, local and process precedence', async () => {
    vi.stubEnv('DEBUG', undefined)
    const root = await mkdtemp(join(tmpdir(), 'finance-csv-env-'))
    try {
      await writeFile(
        join(root, '.env'),
        'DEBUG=false\nDEBUG_PRIVATE=not-public\n',
      )
      expect(csvValidationDefines('test', root)).toEqual({
        'import.meta.env.DEBUG': '"false"',
      })
      await writeFile(join(root, '.env.test'), 'DEBUG=true\n')
      expect(csvValidationDefines('test', root)).toEqual({
        'import.meta.env.DEBUG': '"true"',
      })
      await writeFile(join(root, '.env.test.local'), 'DEBUG=false\n')
      expect(csvValidationDefines('test', root)).toEqual({
        'import.meta.env.DEBUG': '"false"',
      })
      vi.stubEnv('DEBUG', 'true')
      expect(csvValidationDefines('test', root)).toEqual({
        'import.meta.env.DEBUG': '"true"',
      })
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it.each([
    { debug: 'false', enabled: false },
    { debug: 'true', enabled: true },
    { debug: 'release', enabled: true },
  ])(
    'applies validation settings to actual client and worker bundles: %j',
    async ({ debug, enabled }) => {
      vi.stubEnv('DEBUG', debug)
      const root = await mkdtemp(join(tmpdir(), 'finance-csv-debug-'))
      try {
        await writeFile(
          join(root, 'main.js'),
          `
          globalThis.probe = {
            validation: import.meta.env['DEBUG'] !== 'false',
            createWorker: () => new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }),
          };
        `,
        )
        await writeFile(
          join(root, 'worker.js'),
          `self.postMessage(import.meta.env['DEBUG'] !== 'false');`,
        )
        const result = await build({
          configFile: resolve(import.meta.dirname, '../vite.config.ts'),
          root,
          mode: 'test',
          publicDir: false,
          logLevel: 'silent',
          build: {
            write: false,
            minify: false,
            rollupOptions: { input: join(root, 'main.js') },
          },
        })
        const output = result.output
        const client = output.find(
          (item) => item.type === 'chunk' && item.isEntry,
        )
        const worker = output.find(
          (item) =>
            item.type === 'asset' && /worker.*\.js$/.test(item.fileName),
        )
        expect(client).toBeDefined()
        expect(worker).toBeDefined()
        const context = { globalThis: {} }
        runInNewContext(
          client.code.replaceAll(
            'import.meta.url',
            JSON.stringify('https://dashboard.example/'),
          ),
          context,
        )
        expect(context.globalThis.probe.validation).toBe(enabled)
        const postMessage = vi.fn()
        runInNewContext(worker.source, { self: { postMessage } })
        expect(postMessage).toHaveBeenCalledWith(enabled)
      } finally {
        await rm(root, { recursive: true, force: true })
      }
    },
  )
})
