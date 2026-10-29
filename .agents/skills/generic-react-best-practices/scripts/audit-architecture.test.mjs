import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { expect, it } from 'vitest'

import { architectureCandidates } from './audit-architecture.mjs'

it('enumerates mixed presentation, visual-only features and noncanonical type contracts', () => {
  const root = mkdtempSync(join(tmpdir(), 'architecture-inventory-'))
  const folder = join(root, 'src/domains/invoices/components')
  mkdirSync(folder, { recursive: true })
  try {
    writeFileSync(
      join(folder, 'Panel.feature.tsx'),
      `
      import {useInvoices} from '../services/useInvoices'
      export function Panel() {const invoices = useInvoices(); return <div><Label label={invoices.length}/></div>}
      function Label({label}) {return <section><span>{label}</span></section>}
    `,
    )
    writeFileSync(
      join(folder, 'Label.feature.tsx'),
      'export function Label({label}) {return <span>{label}</span>}',
    )
    writeFileSync(
      join(folder, 'Panel.types.ts'),
      'export type InvoiceSummary = {reference: string}',
    )
    writeFileSync(
      join(folder, 'Panel.test.ts'),
      'export type Fixture = {id: string}',
    )
    expect(architectureCandidates(root)).toEqual([
      expect.objectContaining({
        name: 'Label',
        reason: 'visual-only feature: rename to view',
      }),
      expect.objectContaining({
        name: 'Label',
        reason: 'local presentation: review extraction to a view',
      }),
      expect.objectContaining({
        name: 'InvoiceSummary',
        reason: 'support contract: review entity vs local helper/component API',
      }),
    ])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
