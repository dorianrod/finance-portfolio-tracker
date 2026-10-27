import { resolve } from 'node:path'

import { ESLint, Linter } from 'eslint'
import ts from 'typescript'
import tseslint from 'typescript-eslint'
import { describe, expect, it } from 'vitest'

import noSharedUiInternalLayout from './no-shared-ui-internal-layout.js'

const directory = resolve(import.meta.dirname, '..')
const uiFile = 'src/shared/ui/LintButton.view.tsx'
const mainFile = 'src/main.tsx'
const component = `
  import { Fragment, createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
  export function Button(props: Omit<ComponentPropsWithoutRef<'button'>, 'className'>) {
    return <button {...props} className="px-3 py-2 gap-2" />
  }
  export function GenericBox<T extends 'div' | 'span' = 'div'>({ as, ...props }: Omit<ComponentPropsWithoutRef<T>, 'className'> & { as?: T }) { return createElement(as ?? 'div', props) }
  export function Card({ children }: { children: ReactNode }) { return <section>{children}</section> }
  function Body({ children }: { children: ReactNode }) { return <div>{children}</div> }
  Card.Body = Body
  export function Provider({ children }: { children: ReactNode }) { return <Fragment>{children}</Fragment> }
`
const imports = `import { Button, Card, Provider, GenericBox } from '@/shared/ui/LintButton.view'`
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
        local: {
          rules: { 'no-shared-ui-internal-layout': noSharedUiInternalLayout },
        },
      },
      rules: { 'local/no-shared-ui-internal-layout': 'warn' },
    },
    { filename: resolve(directory, file) },
  )
}

describe('caller-owned internal layout', () => {
  it.each([
    '<Button><span className="p-4">Save</span></Button>',
    'function renderLabel() { return <span className="p-4">Save</span> }; <Button>{renderLabel()}</Button>',
    '<GenericBox><span className="p-4">Save</span></GenericBox>',
    '<Button><><span className="mt-2">Save</span></></Button>',
    '<Card><Card.Body><div className="flex gap-4">Body</div></Card.Body></Card>',
    '<Button>{visible ? <span className="p-4" /> : null}</Button>',
    'const content = <span className="p-4" />; <Button>{content}</Button>',
    'function Label() { return <span className="p-4" /> }; <Button><Label /></Button>',
    '<Button><span style={{ paddingInline: 12 }}>Save</span></Button>',
    'const layout = { margin: 4 }; <Button><span style={layout} /></Button>',
    'function Content({ css }: { css: unknown }) { return <Button><span style={css as React.CSSProperties} /></Button> }',
    'const props = { className: "p-4" }; <Button><span {...props} /></Button>',
    'const props = { style: { gap: 4 } }; <Card><div {...props} /></Card>',
    '<Button style={{ padding: 12 }}>Save</Button>',
    '<Card.Body><span className="p-4">Body</span></Card.Body>',
    'import { createElement } from "react"; const save = Button; createElement(save, null, <span className="p-4">Save</span>)',
    'import { createElement } from "react"; createElement(Button, null, createElement("span", { className: "p-4" }, "Save"))',
    'import { createElement as element } from "react"; element(Button, { style: { margin: 2 } })',
    'import { cloneElement } from "react"; cloneElement(<Button />, { style: { padding: 2 } })',
    'import { cloneElement } from "react"; const element = <Button />; cloneElement(element, { style: { padding: 2 } })',
    'import { createElement } from "react"; <div className="[&>button]:p-4">{createElement(Button)}</div>',
    '<div className="[&>button]:p-4"><Button /></div>',
    '<div className="*:p-4"><Button /></div>',
    'function Shell({ children }) { return <Card><Card.Body>{children}</Card.Body></Card> }; <Shell><span className="p-4" /></Shell>',
    'function Shell({ children: body }) { return <Card>{body}</Card> }; <Shell><span style={{ padding: 4 }} /></Shell>',
    'function Shell(props) { return <Card>{props.children}</Card> }; <Shell><span className="p-4" /></Shell>',
    'function Shell(props) { const { children: body } = props; return <Card>{body}</Card> }; <Shell><span className="p-4" /></Shell>',
    'function Shell({ title, ...props }: { title?: string; children: React.ReactNode }) { return <Card {...props} /> }; <Shell><span className="p-4" /></Shell>',
    'function Inner({ children }) { return <Card>{children}</Card> }; function Shell({ children }) { return <Inner>{children}</Inner> }; <Shell><span className="p-4" /></Shell>',
    'function Shell({ children }) { const body = children; return <Card>{body}</Card> }; <Shell><span className="p-4" /></Shell>',
    'import { createElement } from "react"; function Shell({ children }) { return createElement(Card, null, children) }; createElement(Shell, null, <span className="p-4" />)',
  ])(
    'reports injected layout: %s',
    (code) => {
      const messages = lint(`${imports}; ${code}`)
      expect(messages.length).toBeGreaterThan(0)
      expect(
        messages.every(
          (m) =>
            m.severity === 1 &&
            m.ruleId === 'local/no-shared-ui-internal-layout',
        ),
      ).toBe(true)
    },
    20_000,
  )

  it('follows an imported extracted component', () => {
    expect(
      lint(
        `${imports}; import { Label } from '@/shared/LintLabel.view'; <Button><Label /></Button>`,
        mainFile,
        {
          'src/shared/LintLabel.view.tsx':
            'export function Label() { return <span className="px-4">Save</span> }',
        },
      ),
    ).toMatchObject([{ messageId: 'internal', severity: 1 }])
  })

  it('follows an imported wrapper that forwards children into shared UI', () => {
    expect(
      lint(
        `import { Shell } from '@/shared/LintShell.view'; <Shell><div className="p-4" /></Shell>`,
        mainFile,
        {
          'src/shared/LintShell.view.tsx': `${imports}; export function Shell({ children }) { return <Card>{children}</Card> }`,
        },
      ),
    ).toMatchObject([{ messageId: 'internal', severity: 1 }])
  })

  it.each([
    '<div className="mt-2 flex gap-4"><Button>Save</Button><Button>Cancel</Button></div>',
    '<Provider><div className="p-4"><Button>Save</Button></div></Provider>',
    '<Button size="compact">Save</Button>',
    '<Card><Card.Body><Button>Save</Button></Card.Body></Card>',
    '<Button><span>Save</span></Button>',
    '<div style={{ width: measuredWidth }}><Button>Save</Button></div>',
    '<Card><svg><rect x={0} y={0} width={width} height={height} /></svg></Card>',
    'function External(props) { return <div {...props} /> }; <External><div className="p-4" /></External>',
    'function Shell({ children }) { return <><Card>Heading</Card>{children}</> }; <Shell><div className="p-4" /></Shell>',
    'function Shell({ children }) { return <Provider>{children}</Provider> }; <Shell><div className="p-4" /></Shell>',
    'function Shell({ children }) { return <Card>{children}</Card> }; <div className="p-4"><Shell><span>Body</span></Shell></div>',
    'function Shell({ children }) { return <Card>{children}</Card> }; <Shell><Card.Body>Body</Card.Body></Shell>',
    'function Shell({ children, className }) { return <div className={className}><Card>{children}</Card></div> }; <Shell className="mt-2"><span>Body</span></Shell>',
    'function Shell({ children }) { return <Shell>{children}</Shell> }; <Shell><div className="p-4" /></Shell>',
  ])(
    'accepts external layout, standard UI and data geometry: %s',
    (code) => {
      expect(lint(`${imports}; ${code}`)).toEqual([])
    },
    20_000,
  )

  it('allows implementation styling inside shared/ui', () => {
    expect(
      lint(
        'export function Button() { return <button><span className="px-3 py-2">Save</span></button> }',
        uiFile,
      ),
    ).toEqual([])
  })

  it('handles recursive caller components without looping', () => {
    expect(
      lint(
        `${imports}; function Item() { return <><span className="p-4" /><Item /></> }; <Card><Item /></Card>`,
      ),
    ).toMatchObject([{ messageId: 'internal' }])
  })
})

describe('configured internal layout enforcement', () => {
  it('enables an error without an automatic fix', async () => {
    const eslint = new ESLint({ cwd: directory })
    const [result] = await eslint.lintText(
      `import { Button } from '@/shared/ui/controls/Button.view'; <Button><span className="p-4">Save</span></Button>`,
      { filePath: resolve(directory, mainFile) },
    )
    expect(
      result.messages.filter(
        (m) => m.ruleId === 'local/no-shared-ui-internal-layout',
      ),
    ).toMatchObject([{ severity: 2, messageId: 'internal' }])
    expect(noSharedUiInternalLayout.meta).not.toHaveProperty('fixable')
  }, 20_000)
})
