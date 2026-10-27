import { resolve } from 'node:path'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const directory = resolve(import.meta.dirname, '..')
const eslint = new ESLint({ cwd: directory })

async function lint(code, file = 'src/main.tsx') {
  const [result] = await eslint.lintText(code, {
    filePath: resolve(directory, file),
  })
  return result.messages.filter(
    (message) =>
      message.fatal || message.ruleId === 'local/no-domain-accessibility',
  )
}

describe('configured accessibility boundary', () => {
  it.each([
    '<button aria-label="Details" />',
    '<Toggle aria-pressed={active} />',
    '<svg aria-hidden="true" />',
    '<div role="status" />',
    '<button tabIndex={-1} />',
    '<input autoFocus />',
    '<button onKeyDown={navigate} />',
    '<button onFocusCapture={open} />',
    '<Control onBlur={close} />',
    '<Panel onOpenAutoFocus={focus} />',
    '<Panel onInteractOutside={close} />',
    '<button {...{ "aria-label": "Details" }} />',
    'const props = { role: "status" }; <div {...props} />',
    'import type { ButtonHTMLAttributes } from "react"; const props: ButtonHTMLAttributes<HTMLButtonElement> = { "aria-label": "Details" }; <button {...props} />',
    'const props = ({ role: "status" } as unknown); <div {...props} />',
    'const props = { onFocus: open }; <div {...{ ...props }} />',
    'function Example(props: { "aria-label": string }) { return <button {...props} /> }',
    'const props = visible ? { "aria-label": "Details" } : {}; <button {...props} />',
    'const button = document.createElement("button"); button.focus()',
    'const button = document.createElement("button"); button["blur"]()',
    'const element = document.activeElement',
    'const root = document; root.addEventListener("keydown", handler)',
    'const key = "keyup"; window.removeEventListener(key, handler)',
    'document.body.setAttribute("aria-hidden", "true")',
    'document.body.setAttribute("tabIndex", "-1")',
    'document.querySelector("button")?.focus()',
    'document.body.tabIndex = -1',
    'document.body.role = "dialog"',
    'window.onkeydown = handler',
    'import { createElement as element } from "react"; element("button", { "aria-label": "Details" })',
    'import * as React from "react"; React.createElement("div", { role: "status" })',
  ])(
    'rejects distributed wiring: %s',
    async (code) => {
      const messages = await lint(code)
      expect(messages).toHaveLength(1)
      expect(messages[0].messageId).toBe('wiring')
      expect(messages[0].severity).toBe(2)
    },
    20_000,
  )

  it.each([
    'import { Root as Tabs } from "@radix-ui/react-tabs"',
    'import * as Tooltip from "@radix-ui/react-tooltip"',
    'export { Root } from "@radix-ui/react-dialog"',
    'export * from "@radix-ui/react-popover"',
    'const library = import("@radix-ui/react-tabs")',
    'import { Tabs } from "radix-ui"',
  ])('rejects direct primitive imports: %s', async (code) => {
    expect((await lint(code)).map(({ messageId }) => messageId)).toEqual([
      'library',
    ])
  })

  it.each([
    '<Button label={label} onClick={save} />',
    '<ToggleButton active={active} label={label} onClick={toggle} />',
    '<Popover open={open} onOpenChange={setOpen} />',
    '<label>Name<input onChange={change} /></label>',
    '<form onSubmit={save}><button>Save</button></form>',
    '<Button onIntent={preload} />',
    'const props = { label, active }; <ToggleButton {...props} />',
    'import type { SVGProps } from "react"; function Shape(props: SVGProps<SVGSVGElement>) { return <svg {...props} /> }',
    'import type { RectangleProps } from "recharts"; function Shape(props: RectangleProps) { return <rect {...props} /> }',
    'const model = { focus() {}, activeElement: "asset" }; model.focus(); model.activeElement',
    'window.addEventListener("resize", resize)',
    'document.body.setAttribute("data-theme", theme)',
    'const data = { role: "manager" }; send(data)',
    'import { Tooltip } from "@/shared/ui/Tooltip.view"',
  ])(
    'accepts semantic data, native HTML and unrelated APIs: %s',
    async (code) => {
      expect(await lint(code)).toEqual([])
    },
  )

  it.each([
    'src/shared/ui/ColHeader.view.tsx',
    'src/shared/ui/SidePanel.view.test.tsx',
  ])('exempts %s', async (file) => {
    const messages = await lint(
      '<button aria-label="Details" onFocus={focus} />',
      file,
    )
    expect(messages).toEqual([])
  })

  it('also checks domain helpers and shared utilities', async () => {
    for (const file of [
      'src/domains/portfolio/features/data-quality/features/assessment/helpers/formatters/dataQualityDimensionLabels.ts',
      'src/shared/helpers/presenters/getErrorMessage.ts',
    ]) {
      expect(
        (await lint('document.body.focus()', file)).map(
          ({ messageId }) => messageId,
        ),
      ).toEqual(['wiring'])
    }
  })

  it.each([
    `export {Root as Popover} from '@radix-ui/react-popover'`,
    `import {Root} from '@radix-ui/react-popover'; export {Root as Popover}`,
    `export * from '@radix-ui/react-popover'`,
    `export * as Popover from '@radix-ui/react-popover'`,
  ])(
    'rejects bare primitive re-exports through shared UI: %s',
    async (code) => {
      expect(
        (await lint(code, 'src/shared/ui/Popover.view.tsx')).map(
          ({ messageId }) => messageId,
        ),
      ).toEqual(['rawPrimitive'])
    },
  )

  it.each([
    `import {Root} from '@radix-ui/react-popover'; export const Popover = Root`,
    `import {Root} from '@radix-ui/react-popover'; export default Root`,
  ])('rejects unadapted primitive aliases: %s', async (code) => {
    expect(
      (await lint(code, 'src/shared/ui/Popover.view.tsx')).some(
        ({ messageId }) => messageId === 'rawPrimitive',
      ),
    ).toBe(true)
  })

  it.each([
    `import type {AriaRole} from 'react'; export function Popover({role}: {role?: AriaRole}) {return <div role={role} />}`,
    `import type {HTMLAttributes} from 'react'; export function Popover(props: Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'style'>) {return <div {...props} />}`,
    `import type {AriaRole} from 'react'; const Panel = ({role}: {role?: AriaRole}) => <div role={role} />; export {Panel as Popover}`,
    `import {memo} from 'react'; export const Popover = memo((props: {onKeyDown?: () => void}) => <div {...props} />)`,
    `import {Component} from 'react'; export class Popover extends Component<{tabIndex: number}> {render() {return <div tabIndex={this.props.tabIndex} />}}`,
    `export function Popover() {return null}; Popover.Content = ({role}: {role: 'dialog'}) => <div role={role} />`,
  ])(
    'rejects exposed wiring in public primitive contracts: %s',
    async (code) => {
      expect(
        (await lint(code, 'src/shared/ui/Popover.view.tsx')).map(
          ({ messageId }) => messageId,
        ),
      ).toEqual(['publicWiring'])
    },
  )

  it.each([
    `export function Popover({label, expanded}: {label: string; expanded: boolean}) {return <div role="dialog" aria-label={label} aria-expanded={expanded} />}`,
    `import {Root} from '@radix-ui/react-popover'; export function Popover({open}: {open: boolean}) {return <Root open={open} />}`,
    `export type {PopoverProps} from '@radix-ui/react-popover'`,
    `export {type PopoverProps} from '@radix-ui/react-popover'`,
    `export type * as Popover from '@radix-ui/react-popover'`,
    `import type {ControlProps} from './controlProps'; import type {HTMLAttributes} from 'react'; export function Popover(props: ControlProps<HTMLAttributes<HTMLDivElement>>) {return <div {...props} role="dialog" />}`,
    `function Internal({role}: {role: 'dialog'}) {return <div role={role} />}; export function Popover() {return <Internal role="dialog" />}`,
  ])(
    'preserves semantic APIs, internal wiring and type contracts: %s',
    async (code) => {
      expect(await lint(code, 'src/shared/ui/Popover.view.tsx')).toEqual([])
    },
  )
})
