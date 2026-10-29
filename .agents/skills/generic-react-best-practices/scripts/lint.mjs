#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const eslintCli = join(
  dirname(require.resolve('eslint/package.json')),
  'bin/eslint.js',
)
const toolingRoot = resolve(import.meta.dirname, '..')

const args = process.argv.slice(2)
const cacheOptions = args.includes('--no-cache')
  ? []
  : [
      '--cache',
      '--cache-strategy',
      'content',
      '--cache-location',
      'node_modules/.cache/eslint/results.cache',
    ]
const child = spawn(
  process.execPath,
  [eslintCli, '.', ...cacheOptions, ...args],
  { stdio: 'inherit' },
)
child.on('error', (error) => {
  console.error(error.message)
  process.exitCode = 1
})
child.on('exit', (code) => {
  if (code !== 0) {
    process.exitCode = code ?? 1
    return
  }
  const tooling = spawn(
    process.execPath,
    [
      eslintCli,
      '.',
      '--config',
      fileURLToPath(new URL('../eslint.config.mjs', import.meta.url)),
      '--max-warnings',
      '0',
      ...(args.includes('--fix') ? ['--fix'] : []),
    ],
    { cwd: toolingRoot, stdio: 'inherit' },
  )
  tooling.on('error', (error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  tooling.on('exit', (status) => {
    process.exitCode = status ?? 1
  })
})
