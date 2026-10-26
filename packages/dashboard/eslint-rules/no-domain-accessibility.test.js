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
})
