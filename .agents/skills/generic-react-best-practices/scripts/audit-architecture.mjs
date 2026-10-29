#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { Linter } from 'eslint'
import tseslint from 'typescript-eslint'

import { isProductionSource } from '../eslint-rules/ast-bindings.js'
import {
  analyzeComponentRoles,
  exportedComponent,
} from '../eslint-rules/component-role-analysis.js'
import { isMain, projectOptions } from './project-options.mjs'

export function architectureCandidates(directory) {
  const candidates = []
  const linter = new Linter({ cwd: directory })
  function visit(folder) {
    for (const entry of readdirSync(folder, { withFileTypes: true }).sort(
      (a, b) => a.name.localeCompare(b.name),
    )) {
      const file = join(folder, entry.name)
      if (entry.isDirectory()) {
        visit(file)
        continue
      }
      const feature = file.endsWith('.feature.tsx')
      const supportTypes =
        file.endsWith('.ts') &&
        file.replaceAll('\\', '/').includes('/src/domains/') &&
        !/\/types\/.*\.type\.ts$/u.test(file) &&
        isProductionSource(file)
      if (!feature && !supportTypes) continue
      const messages = linter.verify(
        readFileSync(file, 'utf8'),
        {
          files: ['**/*.{ts,tsx}'],
          languageOptions: { parser: tseslint.parser },
          plugins: {
            inventory: {
              rules: {
                roles: {
                  create(context) {
                    return {
                      'Program:exit'(program) {
                        if (supportTypes) {
                          for (const node of program.body) {
                            const declaration =
                              node.type === 'ExportNamedDeclaration'
                                ? node.declaration
                                : null
                            if (
                              declaration?.type === 'TSTypeAliasDeclaration' &&
                              declaration.typeAnnotation.type ===
                                'TSTypeLiteral'
                            )
                              candidates.push({
                                file: relative(directory, file),
                                line: declaration.loc.start.line,
                                name: declaration.id.name,
                                reason:
                                  'support contract: review entity vs local helper/component API',
                                business: [],
                                opaque: [],
                              })
                          }
                          return
                        }
                        for (const component of analyzeComponentRoles(
                          context.sourceCode,
                          program,
                        )) {
                          const business = [...component.business]
                          const opaque = [...component.opaque]
                          let reason
                          if (
                            !exportedComponent(
                              component.node,
                              context.sourceCode,
                            ) &&
                            component.elements > 1 &&
                            business.length === 0
                          )
                            reason =
                              'local presentation: review extraction to a view'
                          else if (
                            exportedComponent(
                              component.node,
                              context.sourceCode,
                            ) &&
                            business.length === 0
                          )
                            reason =
                              opaque.length === 0
                                ? 'visual-only feature: rename to view'
                                : 'unresolved responsibility: inspect opaque dependencies'
                          else if (
                            exportedComponent(
                              component.node,
                              context.sourceCode,
                            ) &&
                            component.elements >= 12
                          )
                            reason =
                              'feature with substantial JSX: review presentation boundary'
                          if (reason)
                            candidates.push({
                              file: relative(directory, file),
                              line: component.node.loc.start.line,
                              name: component.name,
                              reason,
                              business,
                              opaque,
                            })
                        }
                      },
                    }
                  },
                },
              },
            },
          },
          rules: { 'inventory/roles': 'error' },
        },
        { filename: file },
      )
      if (messages.some((message) => message.fatal))
        throw new Error(`Cannot inspect ${file}: ${messages[0].message}`)
    }
  }
  visit(join(directory, 'src'))
  return candidates
}

if (isMain(import.meta.url)) {
  const { root: directory } = projectOptions()
  const candidates = architectureCandidates(directory)
  for (const candidate of candidates) {
    console.log(
      `${candidate.file}:${candidate.line} ${candidate.name}: ${candidate.reason}`,
    )
    if (candidate.business.length)
      console.log(`  Business evidence: ${candidate.business.join(', ')}`)
    if (candidate.opaque.length)
      console.log(`  Review: ${candidate.opaque.join(', ')}`)
  }
  console.log(
    `${candidates.length} review candidates. This inventory does not replace lint or a responsibility review.`,
  )
}
