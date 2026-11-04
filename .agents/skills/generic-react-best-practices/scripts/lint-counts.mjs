#!/usr/bin/env node
import { resolve } from 'node:path'
import { parseArgs } from 'node:util'

import { ESLint } from 'eslint'

import { isMain } from './project-options.mjs'

export function summarizeLintResults(results) {
  const rules = new Map()
  const totals = {
    errors: 0,
    warnings: 0,
    suppressedErrors: 0,
    suppressedWarnings: 0,
  }

  for (const result of results) {
    const fileRules = new Set()
    for (const [messages, suppressed] of [
      [result.messages, false],
      [result.suppressedMessages ?? [], true],
    ]) {
      for (const message of messages) {
        const ruleId = message.ruleId ?? null
        if (!rules.has(ruleId)) {
          rules.set(ruleId, {
            ruleId,
            errors: 0,
            warnings: 0,
            suppressedErrors: 0,
            suppressedWarnings: 0,
            files: 0,
          })
        }
        let key = message.severity === 2 ? 'errors' : 'warnings'
        if (suppressed)
          key =
            message.severity === 2 ? 'suppressedErrors' : 'suppressedWarnings'
        rules.get(ruleId)[key] += 1
        totals[key] += 1
        fileRules.add(ruleId)
      }
    }
    for (const ruleId of fileRules) rules.get(ruleId).files += 1
  }

  return {
    schemaVersion: 1,
    filesLinted: results.length,
    totals,
    rules: [...rules.values()].sort(
      (left, right) =>
        right.errors - left.errors ||
        right.warnings - left.warnings ||
        right.suppressedErrors +
          right.suppressedWarnings -
          left.suppressedErrors -
          left.suppressedWarnings ||
        String(left.ruleId).localeCompare(String(right.ruleId), 'en'),
    ),
  }
}

export function formatLintCounts(report) {
  const rows = [
    ['Rule', 'Errors', 'Warnings', 'Suppressed', 'Files'],
    ...report.rules.map((rule) => [
      rule.ruleId ?? '(no rule)',
      String(rule.errors),
      String(rule.warnings),
      String(rule.suppressedErrors + rule.suppressedWarnings),
      String(rule.files),
    ]),
  ]
  const widths = rows[0].map((_, index) =>
    Math.max(...rows.map((row) => row[index].length)),
  )
  const { errors, warnings, suppressedErrors, suppressedWarnings } =
    report.totals
  return [
    `${report.filesLinted} files; ${errors} errors; ${warnings} warnings`,
    `Suppressed diagnostics: ${suppressedErrors} errors; ${suppressedWarnings} warnings (excluded from active totals)`,
    '',
    ...rows.map((row) =>
      row
        .map((cell, index) =>
          index === 0
            ? cell.padEnd(widths[index])
            : cell.padStart(widths[index]),
        )
        .join('  ')
        .trimEnd(),
    ),
  ].join('\n')
}

if (isMain(import.meta.url)) {
  try {
    const { values, positionals } = parseArgs({
      allowPositionals: true,
      options: {
        root: { type: 'string', default: process.cwd() },
        json: { type: 'boolean' },
        help: { type: 'boolean' },
      },
    })
    if (values.help) {
      console.log(
        'Usage: react-best-practices-lint-counts [--root directory] [--json] [paths...]\n' +
          'Counts active and suppressed ESLint diagnostics by rule using the project configuration.\n' +
          'Defaults to the whole project. Exit: 0 without active errors, 1 with active errors, 2 on failure.\n' +
          'This report does not enforce the normal lint warning budget.',
      )
    } else {
      const eslint = new ESLint({
        cwd: resolve(values.root),
        cache: false,
        fix: false,
      })
      const report = summarizeLintResults(
        await eslint.lintFiles(positionals.length ? positionals : ['.']),
      )
      console.log(
        values.json
          ? JSON.stringify(report, null, 2)
          : formatLintCounts(report),
      )
      if (report.totals.errors > 0) process.exitCode = 1
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 2
  }
}
