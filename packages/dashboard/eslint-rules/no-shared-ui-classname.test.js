import { resolve } from 'node:path'

import { ESLint, Linter } from 'eslint'
import ts from 'typescript'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import noSharedUiClassname from './no-shared-ui-classname.js'

const directory = resolve(import.meta.dirname, '..')
const uiFile = 'src/shared/ui/LintButton.view.tsx'
const mainFile = 'src/main.tsx'
const component = `
  import type { ComponentPropsWithoutRef } from 'react'
  export function Button(props: Omit<ComponentPropsWithoutRef<'button'>, 'className'>) {
    return <button {...props} className="rounded" />
  }
  function Header(props: { children?: React.ReactNode }) { return <header {...props} /> }
  Button.Header = Header
`
const imports = `import { Button } from '@/shared/ui/LintButton.view'`
const linter = new Linter({ cwd: directory })

function lint(code, file = mainFile, extraFiles = {}) {
  const files = new Map(
    Object.entries({ [uiFile]: component, ...extraFiles, [file]: code }).map(
      ([name, contents]) => [resolve(directory, name), contents],
    ),
  )
  const options = {
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
    types: ['react'],
    paths: { '@/*': [resolve(directory, 'src/*')] },
  }
  const host = ts.createCompilerHost(options)
  const readFile = host.readFile.bind(host)
  const fileExists = host.fileExists.bind(host)
  host.readFile = (name) => files.get(name) ?? readFile(name)
  host.fileExists = (name) => files.has(name) || fileExists(name)
  const program = ts.createProgram([...files.keys()], options, host)
  return linter.verify(
    code,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: { programs: [program], tsconfigRootDir: directory },
      },
      plugins: {
        local: { rules: { 'no-shared-ui-classname': noSharedUiClassname } },
      },
      rules: { 'local/no-shared-ui-classname': 'warn' },
    },
    { filename: resolve(directory, file) },
  )
}

describe('shared UI component APIs', () => {
  it.each([
    [
      'explicit props',
      'function Button(props: { className?: string }) { return <button /> }',
    ],
    [
      'destructuring',
      'function Button({ className }: { className?: string }) { return <button className={className} /> }',
    ],
    [
      'inferred destructuring',
      'const Button = ({ className = "" }) => <button className={className} />',
    ],
    [
      'HTMLAttributes',
      'function Button(props: React.HTMLAttributes<HTMLButtonElement>) { return <button {...props} /> }',
    ],
    [
      'ComponentProps',
      'function Button(props: React.ComponentProps<"button">) { return <button {...props} /> }',
    ],
    [
      'ComponentPropsWithoutRef',
      'const Button = (props: React.ComponentPropsWithoutRef<"button">) => <button {...props} />',
    ],
    [
      'an intersection',
      'function Button(props: React.ComponentPropsWithRef<"button"> & { variant: "primary" }) { return <button /> }',
    ],
    [
      'an interface',
      'interface Props extends React.HTMLAttributes<HTMLDivElement> { selected: boolean }; function Button(props: Props) { return <div /> }',
    ],
    [
      'a union',
      'function Button(props: { className: string } | { label: string }) { return <button /> }',
    ],
    [
      'a constrained generic',
      'function Button<T extends { className?: string }>(props: T) { return <button /> }',
    ],
    [
      'polymorphic props',
      'function Button<T extends "button" | "a" = "button">(props: React.ComponentPropsWithoutRef<T> & { as?: T }) { return <button /> }',
    ],
    [
      'memo',
      'const Button = React.memo((props: React.ComponentProps<"button">) => <button {...props} />)',
    ],
    [
      'forwardRef',
      'const Button = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button">>((props, ref) => <button {...props} ref={ref} />)',
    ],
    [
      'a typed component',
      'const Button: React.FC<React.HTMLAttributes<HTMLButtonElement>> = (props) => <button {...props} />',
    ],
    [
      'an anonymous default',
      'export default function(props: { className?: string }) { return <button /> }',
    ],
    [
      'a wrapped default',
      'export default React.memo((props: { className?: string }) => <button />)',
    ],
    [
      'an inline slot',
      'function Button() { return <button /> }; Button.Header = (props: { className?: string }) => <header />',
    ],
    [
      'an object slot',
      'const Button = { Header: (props: { className?: string }) => <header /> }',
    ],
    [
      'a named slot',
      'function Button() { return <button /> }; function Header(props: React.ComponentProps<"header">) { return <header /> }; Button.Header = Header',
    ],
  ])(
    'reports %s',
    (_name, code) => {
      expect(
        lint(`import * as React from 'react'; ${code}`, uiFile),
      ).toMatchObject([{ messageId: 'exposedClassName', severity: 1 }])
    },
    20_000,
  )

  it.each([
    'function Button(props: Omit<React.ComponentPropsWithoutRef<"button">, "className">) { return <button {...props} className="rounded" /> }',
    'function Button<T extends "button" | "a" = "button">(props: Omit<React.ComponentPropsWithoutRef<T>, "className"> & { as?: T }) { return <button className="rounded" /> }',
    'function Button({ variant }: { variant: "primary" | "secondary" }) { return <button className={variant === "primary" ? "bg-blue-500" : "bg-gray-500"} /> }',
    'const Button = React.memo((props: Omit<React.ComponentProps<"button">, "className">) => <button {...props} className="rounded" />)',
    'const Button = React.forwardRef<HTMLButtonElement, Omit<React.ComponentProps<"button">, "className">>((props, ref) => <button {...props} ref={ref} className="rounded" />)',
    'const className = "rounded"; function Button() { return <button className={className} /> }',
    'function Button() { return React.createElement("button", { className: "rounded" }) }',
    'function Label({ as: Tag = "span" }: { as?: "span" | "div" }) { return <Tag className="rounded" /> }',
    'function Label({ as = "span" }: { as?: "span" | "div" }) { return React.createElement(as, { className: "rounded" }) }',
    'import * as Primitive from "@radix-ui/react-tabs"; function Tabs() { return <Primitive.List className="flex" /> }',
  ])('accepts internal styling and APIs without className: %s', (code) => {
    expect(lint(`import * as React from 'react'; ${code}`, uiFile)).toEqual([])
  })

  it('does not impose the shared API restriction on feature components', () => {
    expect(
      lint(
        'function Feature(props: { className?: string }) { return <div className={props.className} /> }',
      ),
    ).toEqual([])
  })
})

describe('shared UI callers', () => {
  it.each([
    ['layout classes', `${imports}; <Button className="mt-2" />`],
    ['visual classes', `${imports}; <Button className="bg-red-500" />`],
    ['an undefined value', `${imports}; <Button className={undefined} />`],
    [
      'a renamed import',
      'import { Button as Save } from "@/shared/ui/LintButton.view"; <Save className="mt-2" />',
    ],
    [
      'a relative import',
      'import { Button } from "./shared/ui/LintButton.view"; <Button className="mt-2" />',
    ],
    [
      'a namespace import',
      'import * as UI from "@/shared/ui/LintButton.view"; <UI.Button className="mt-2" />',
    ],
    [
      'a local alias',
      `${imports}; const Save = Button; <Save className="mt-2" />`,
    ],
    ['a compound slot', `${imports}; <Button.Header className="mt-2" />`],
    ['a literal spread', `${imports}; <Button {...{ className: "mt-2" }} />`],
    [
      'an optional typed spread',
      `${imports}; function Example(props: { className?: string }) { return <Button {...props} /> }`,
    ],
    [
      'a native typed spread',
      `${imports}; function Example(props: React.ComponentProps<"button">) { return <Button {...props} /> }`,
    ],
    [
      'nested spreads',
      `${imports}; const props = { className: "mt-2" }; <Button {...{ ...props }} />`,
    ],
    [
      'a union spread',
      `${imports}; const props = visible ? { className: "mt-2" } : { disabled: true }; <Button {...props} />`,
    ],
    [
      'an asserted spread',
      `${imports}; const props = { className: "mt-2" } as unknown; <Button {...props} />`,
    ],
    [
      'an asserted nested spread',
      `${imports}; const props = { className: "mt-2" } as unknown; <Button {...({ ...props } as unknown)} />`,
    ],
    ['a computed key', `${imports}; <Button {...{ ["className"]: "mt-2" }} />`],
    [
      'createElement',
      `${imports}; import { createElement } from 'react'; createElement(Button, { className: "mt-2" })`,
    ],
    [
      'an aliased factory',
      `${imports}; import { createElement as element } from 'react'; element(Button, { className: "mt-2" })`,
    ],
    [
      'a namespace factory',
      `${imports}; import * as React from 'react'; React.createElement(Button.Header, { className: "mt-2" })`,
    ],
    [
      'a locally aliased factory',
      `${imports}; import { createElement } from 'react'; const element = createElement; element(Button, { className: "mt-2" })`,
    ],
    [
      'cloneElement with JSX',
      `${imports}; import { cloneElement } from 'react'; cloneElement(<Button />, { className: "mt-2" })`,
    ],
    [
      'cloneElement with a variable',
      `${imports}; import { cloneElement } from 'react'; const element = <Button />; cloneElement(element, { className: "mt-2" })`,
    ],
    [
      'cloneElement with a factory',
      `${imports}; import { cloneElement, createElement } from 'react'; cloneElement(createElement(Button), { className: "mt-2" })`,
    ],
    [
      'factory props through a spread',
      `${imports}; import { createElement } from 'react'; const props = { className: "mt-2" }; createElement(Button, { ...props })`,
    ],
  ])(
    'reports %s',
    (_name, code) => {
      expect(lint(code)).toMatchObject([
        { messageId: 'suppliedClassName', severity: 1 },
      ])
    },
    20_000,
  )

  it.each([
    'export { Button as Save } from "./ui/LintButton.view"',
    'export * from "./ui/LintButton.view"',
  ])('resolves re-exports: %s', (barrel) => {
    const name = barrel.includes('as Save') ? 'Save' : 'Button'
    expect(
      lint(
        `import { ${name} } from '@/shared/LintExports'; <${name} className="mt-2" />`,
        mainFile,
        {
          'src/shared/LintExports.ts': barrel,
        },
      ),
    ).toMatchObject([{ messageId: 'suppliedClassName', severity: 1 }])
  })

  it('checks calls inside shared/ui as well', () => {
    expect(
      lint(
        `${imports}; function Panel() { return <Button className="mt-2" /> }`,
        'src/shared/ui/LintPanel.view.tsx',
      ),
    ).toMatchObject([{ messageId: 'suppliedClassName', severity: 1 }])
  })

  it.each([
    `${imports}; <div className="mt-2"><Button disabled /></div>`,
    `${imports}; <Button><Button.Header>Title</Button.Header></Button>`,
    `${imports}; const props = { disabled: true }; <Button {...props} />`,
    `${imports}; const className = "title"; const props = { [className]: "Title" } as unknown; <Button {...props} />`,
    `${imports}; function Example(props: Omit<React.ComponentProps<"button">, "className">) { return <Button {...props} /> }`,
    `${imports}; <Button variant="primary" style={{ width: "100%" }} />`,
    `${imports}; <Button />; <button className="mt-2" />`,
    `${imports}; function ButtonOutsideUi(props: React.ComponentProps<"button">) { return <button {...props} /> }; <ButtonOutsideUi className="mt-2" />`,
    'import * as Primitive from "@radix-ui/react-tabs"; <Primitive.List className="flex" />',
    'import { createElement } from "react"; createElement("button", { className: "mt-2" })',
    'import { cloneElement } from "react"; const element = <button />; cloneElement(element, { className: "mt-2" })',
    `${imports}; import { createElement } from 'react'; createElement(Button, { disabled: true })`,
    `${imports}; function createElement(component, props) { return null }; createElement(Button, { className: "mt-2" })`,
  ])(
    'accepts parent layout, internal classes and unrelated APIs: %s',
    (code) => {
      expect(lint(code)).toEqual([])
    },
  )
})

describe('real ESLint configuration', () => {
  const eslint = new ESLint({ cwd: directory })

  it('enables the rule as a warning with no automatic fix', async () => {
    const [result] = await eslint.lintText(
      `
      import { Text } from '@/shared/ui/Text.view'
      <Text className="mt-2">Hello</Text>
    `,
      { filePath: resolve(directory, mainFile) },
    )
    expect(
      result.messages.filter(
        ({ ruleId }) => ruleId === 'local/no-shared-ui-classname',
      ),
    ).toMatchObject([{ severity: 1, messageId: 'suppliedClassName' }])
    expect(result.fatalErrorCount).toBe(0)
    expect(noSharedUiClassname.meta).not.toHaveProperty('fixable')
  }, 20_000)
})
