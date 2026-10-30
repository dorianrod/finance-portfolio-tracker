import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  checkTestColocation,
  snapshotSources,
} from './check-test-colocation.mjs'

const directories = []
afterEach(() => {
  directories
    .splice(0)
    .forEach((root) => rmSync(root, { recursive: true, force: true }))
})
function project() {
  const root = mkdtempSync(join(tmpdir(), 'colocation-'))
  directories.push(root)
  mkdirSync(join(root, 'src'))
  return root
}
function write(root, file, code) {
  const name = join(root, file)
  mkdirSync(dirname(name), { recursive: true })
  writeFileSync(name, code)
}

describe('new-owner test colocation', () => {
  it('includes untracked files and distinguishes presence from meaningful coverage', () => {
    const root = project(),
      baseline = snapshotSources(root)
    write(root, 'src/Panel.view.tsx', 'export function Panel() {return <div/>}')
    expect(checkTestColocation(baseline, snapshotSources(root)).missing).toBe(1)
    write(root, 'src/Panel.view.test.tsx', '')
    expect(checkTestColocation(baseline, snapshotSources(root)).missing).toBe(0)
  })
  it('explains type-only, story and fixture exclusions', () => {
    const root = project(),
      baseline = snapshotSources(root)
    write(
      root,
      'src/types/example.type.ts',
      'export type Example = {id: string}',
    )
    write(
      root,
      'src/mocks/example.mock.ts',
      'export function example() {return 1}',
    )
    write(root, 'src/Example.stories.tsx', 'export const Example = {}')
    expect(
      checkTestColocation(baseline, snapshotSources(root)).rows.map(
        (row) => row.status,
      ),
    ).toEqual(['not-applicable', 'not-applicable', 'not-applicable'])
  })
  it('does not turn a proven legacy move into a new-file requirement', () => {
    const root = project()
    write(root, 'src/Old.view.tsx', 'export function Panel() {return <div/>}')
    const baseline = snapshotSources(root),
      old = baseline.files[0]
    rmSync(join(root, old.file))
    write(root, 'src/New.view.tsx', 'export function Panel() {return <div/>}')
    const current = snapshotSources(root),
      next = current.files[0]
    expect(
      checkTestColocation(baseline, current, {
        moves: [
          {
            from: old.file,
            to: next.file,
            previousSha256: old.sha256,
            sha256: next.sha256,
            reason: 'Same owner moved.',
          },
        ],
        roles: [],
      }).rows[0].status,
    ).toBe('moved')
  })
  it('detects a moved owner losing an existing sibling', () => {
    const root = project()
    write(root, 'src/Old.view.tsx', 'export function Panel() {return <div/>}')
    write(root, 'src/Old.view.test.tsx', '')
    const baseline = snapshotSources(root),
      old = baseline.files.find((row) => row.file === 'src/Old.view.tsx')
    rmSync(join(root, old.file))
    write(root, 'src/New.view.tsx', 'export function Panel() {return <div/>}')
    const current = snapshotSources(root),
      next = current.files.find((row) => row.file === 'src/New.view.tsx')
    expect(
      checkTestColocation(baseline, current, {
        moves: [
          {
            from: old.file,
            to: next.file,
            previousSha256: old.sha256,
            sha256: next.sha256,
            reason: 'Move.',
          },
        ],
        roles: [],
      }).missing,
    ).toBe(1)
  })
  it('requires review for an unresolved exported contract', () => {
    const root = project(),
      baseline = snapshotSources(root)
    write(root, 'src/adapter.ts', 'export function adapt() {return 1}')
    expect(checkTestColocation(baseline, snapshotSources(root)).pending).toBe(1)
  })
  it('keeps an opaque arrow helper pending and accepts a content-matched role review', () => {
    const root = project(),
      baseline = snapshotSources(root)
    write(root, 'src/adapter.ts', 'export const adapt = () => 1')
    const current = snapshotSources(root),
      row = current.files[0]
    expect(checkTestColocation(baseline, current).pending).toBe(1)
    const result = checkTestColocation(baseline, current, {
      moves: [],
      roles: [
        {
          file: row.file,
          sha256: row.sha256,
          role: 'helper',
          reason: 'Pure transformation helper.',
        },
      ],
    })
    expect(result.pending).toBe(0)
    expect(result.missing).toBe(1)
  })
  it('keeps a changed move pending without an explicit same-contract review', () => {
    const root = project()
    write(root, 'src/Old.view.tsx', 'export function Panel() {return <div/>}')
    const baseline = snapshotSources(root),
      old = baseline.files[0]
    rmSync(join(root, old.file))
    write(root, 'src/New.view.tsx', 'export function Panel() {return <span/>}')
    const current = snapshotSources(root),
      next = current.files[0]
    const move = {
      from: old.file,
      to: next.file,
      previousSha256: old.sha256,
      sha256: next.sha256,
      reason: 'Markup changes; supplied-data contract retained.',
    }
    expect(
      checkTestColocation(baseline, current, { moves: [move], roles: [] })
        .pending,
    ).toBe(1)
    expect(
      checkTestColocation(baseline, current, {
        moves: [{ ...move, sameContract: true }],
        roles: [],
      }).pending,
    ).toBe(0)
  })
  it('rejects unavailable baselines and stale move evidence', () => {
    const root = project(),
      current = snapshotSources(root)
    expect(() => checkTestColocation({}, current)).toThrow()
    expect(() =>
      checkTestColocation(current, current, {
        moves: [{ from: 'missing', to: 'missing' }],
        roles: [],
      }),
    ).toThrow()
  })
})
