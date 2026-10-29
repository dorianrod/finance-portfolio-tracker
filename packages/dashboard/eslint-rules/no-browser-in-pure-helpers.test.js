import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '..')
const eslint = new ESLint({ cwd: directory })
const presenter = 'src/shared/helpers/presenters/partitionSlot.ts'

async function lint(code, file = presenter) {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(directory, file),
  })
  return result.messages.filter(
    (message) =>
      message.fatal || message.ruleId === 'local/no-browser-in-pure-helpers',
  )
}

describe('pure helper browser boundary', () => {
  it.each([
    `export function getWidth() {return window.innerWidth}`,
    `export function getWidth() {return globalThis.window.innerWidth}`,
    `export function getWidth() {const browser = window; return browser.innerWidth}`,
    `export function getBody() {return document.body}`,
    `export function getTheme() {return localStorage.getItem('theme')}`,
    `export function getMedia() {return matchMedia('(min-width: 600px)').matches}`,
    `export function getStyle(element: HTMLElement) {return getComputedStyle(element)}`,
    `export function measure(element: HTMLElement) {return element.getBoundingClientRect()}`,
    `export function measure(element: HTMLElement) {return element.clientWidth}`,
    `export function update(element: HTMLElement) {element.style.opacity = '0.5'}`,
    `export function update(element: HTMLElement) {element.setAttribute('data-value', '1')}`,
    `export function update(element: HTMLElement) {element.scrollTop++}`,
  ])(
    'rejects browser context, measurements or effects: %s',
    async (code) => {
      expect(await lint(code)).not.toEqual([])
    },
    20_000,
  )

  it.each([
    `export function getLeft(anchorLeft: number, viewportWidth: number) {return Math.min(anchorLeft, viewportWidth - 320)}`,
    `export function getLeft(rect: DOMRectReadOnly) {return rect.left + rect.width}`,
    `export function getLeft(window: {innerWidth: number}) {return window.innerWidth}`,
    `export function getValue(model: {focus: () => number}) {return model.focus()}`,
    `export function getWindow() {const window = [1, 2]; return window.reduce((sum, n) => sum + n, 0)}`,
    `export type Browser = typeof window; export const defaultWidth = 320`,
  ])(
    'accepts explicit inputs, geometry values and unrelated names: %s',
    async (code) => {
      expect(await lint(code)).toEqual([])
    },
  )

  it('also protects calculators', async () => {
    expect(
      await lint(
        'export const width = window.innerWidth',
        'src/domains/portfolio/features/wealth/helpers/calculators/wealthCalculations/computeTrailing12mSavings.ts',
      ),
    ).not.toEqual([])
  })

  it.each([
    'src/main.tsx',
    'src/shared/ui/usePopoverState.ts',
    'src/domains/portfolio/shared/components/AllocationCategory/helpers/presenters/getAllocationTone.test.ts',
  ])(
    'keeps browser integration and tests outside the pure-helper scope: %s',
    async (file) => {
      expect(await lint('const width = window.innerWidth', file)).toEqual([])
    },
  )
})
